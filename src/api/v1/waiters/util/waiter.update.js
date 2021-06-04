const appRoot = require('app-root-path');
const logger = require(appRoot + '/src/logger').apiLogger;
const Waiter = require(appRoot + '/src/model/waiter');
const WaiterVoting = require(appRoot + '/src/model/waiter-voting');
const constant = require(appRoot + '/src/constant');
const RestaurantUtil = require(appRoot + '/src/api/v1/restaurants/util/restaurants.util');
const mongoose = require('mongoose');
const User = require(appRoot + '/src/model/user');
const Restaurant = require(appRoot + '/src/model/waiter-restaurant');
const emailUtil = require(appRoot + '/src/util/email-util/send-email.js');
const templateEmailUtil = require(appRoot + '/src/util/email-util/email-template.js');
const { Expo } = require('expo-server-sdk');
const { isFrench } = require('../../../../util');
let expo = new Expo();

exports.waiterUpdates = async (body, res, id) => {
  try {
    const waiter = await Waiter.findById(id);
    if (body.status) {
      if (constant.WAITER_STATUSES.includes(body.status)) {
        await Waiter.updateOne(
          { _id: id },
          {
            status: body.status,
          },
        );
        const waiter = await Waiter.findById(id).populate('user_id');
        if (body.status === constant.WAITER_ACTIVE && waiter.user_id) {
          await this.notifyWaiterAboutApproval(waiter);
        }
        if (body.status === constant.WAITER_REJECTED && waiter.user_id) {
          await this.notifyWaiterAboutRejection(waiter);
        }
      } else {
        return res.status(400).json({
          message: 'Invalid status',
        });
      }
    }
    if (body.user_id) {
      const isValidUserId = mongoose.Types.ObjectId.isValid(body.user_id);
      if (isValidUserId) {
        if (waiter.user_id) {
          return res.status(400).json({
            message: 'Waiter is already connected with one user',
          });
        }
        const user = await User.findById(body.user_id);
        if (!user) {
          return res.status(400).json({
            message: 'No user available with this Id',
          });
        }
        const waiterRestaurants = await Restaurant.find({ waiter_id: id }).distinct('_id');
        const userRestaurants = await Restaurant.find({
          user_id: { $in: body.user_id },
          _id: { $in: waiterRestaurants },
        });
        if (userRestaurants.length) {
          return res.status(400).json({
            message: 'Both the waiter and the user who is linking are in the same restaurant.',
          });
        }
        await Waiter.updateOne(
          { _id: id },
          {
            user_id: body.user_id,
          },
        );
        await User.updateOne(
          { _id: body.user_id },
          {
            is_waiter: true,
          },
        );
        await Restaurant.update(
          {
            waiter_id: { $in: id },
          },
          {
            $push: { user_id: body.user_id },
          },
        );
      } else {
        return res.status(400).json({
          message: 'Invalid user_id',
        });
      }
    }
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
  }
};

exports.waiterDeleteAndUpdate = async (id, user_id) => {
  try {
    await Waiter.deleteOne({ _id: id });
    const updateResQuery = { ...(user_id ? { user_id } : {}), waiter_id: id };
    await Restaurant.updateOne(
      updateResQuery,
      {
        $pull: updateResQuery,
      },
      { multi: true },
    );
    if (user_id) {
      const isUserWaiter = await Waiter.findOne({ user_id });
      if (!isUserWaiter) {
        await User.updateOne(
          { _id: user_id },
          {
            is_waiter: false,
          },
        );
      }
    }
    logger.info(`successfully delete Waiter with id: ${id}`);
    return { message: 'Waiter is successfully deleted', isDeleted: true };
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return error;
  }
};

exports.notifyWaiterAboutApproval = async (waiter) => {
  try {
    logger.info('in waiters utils starting [notifyWaiterAboutApproval]');
    const user = waiter.user_id;
    const restaurant = await Restaurant.findOne({ place_id: waiter.restaurant_id });
    await emailUtil.send({
      to: user.email,
      from: constant.EMAIL_FROM,
      name: 'Pourboir',
      templateId: isFrench(user.lang)
        ? constant.TEMPLATE_WAITER_APPROVAL_FRA
        : constant.TEMPLATE_WAITER_APPROVAL,
      placeholders: {
        restaurantName: restaurant.name,
      },
    });
    const expo_notification_token = user.expo_notification_token;
    if (expo_notification_token) {
      let body = constant.APPROVAL_NOTIFICATION(user, restaurant.name);
      const messages = await this.createMessages(body, { path: 'home' }, [expo_notification_token]);
      await this.sendMessages(messages);
    }
  } catch (error) {
    console.log(error);
    logger.error(JSON.stringify((error = error.stack)));
    return error;
  }
};

exports.createMessages = async (body, data, pushTokens) => {
  // Create the messages that you want to send to clents
  let messages = [];
  for (let pushToken of pushTokens) {
    // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      logger.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }
    // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
    messages.push({
      to: pushToken,
      sound: 'default',
      title: 'Pourboir',
      body,
      data,
    });
  }
  return messages;
};
exports.sendMessages = async (messages) => {
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error(error);
    }
  }
  return tickets;
};

exports.notifyWaiterAboutRejection = async (waiter) => {
  try {
    logger.info('in waiters utils starting [notifyWaiterAboutApproval]');
    const user = waiter.user_id;
    const restaurant = await Restaurant.findOne({ place_id: waiter.restaurant_id });
    await emailUtil.send({
      to: user.email,
      from: constant.EMAIL_FROM,
      name: 'Pourboir',
      templateId: isFrench(user.lang)
        ? constant.TEMPLATE_WAITER_REJECTED_FRA
        : constant.TEMPLATE_WAITER_REJECTED,
      placeholders: {
        restaurantName: restaurant.name,
      },
    });
    const expo_notification_token = user.expo_notification_token;
    if (expo_notification_token) {
      let body = constant.REJECTION_NOTIFICATION(user, restaurant.name);
      const messages = await this.createMessages(body, { path: 'home' }, [expo_notification_token]);
      await this.sendMessages(messages);
    }
  } catch (error) {
    console.log(error);
    logger.error(JSON.stringify((error = error.stack)));
    return error;
  }
};
