import { Router } from 'express';
import {
  PUBSUB_TOPIC_MISC,
} from '../../constant';
import {
  userCollection as dbRef,
} from '../../util/firebase';
import publisher from '../../util/gcloudPub';

import {
  AUTHCORE_WEB_HOOK_SECRET,
} from '../../../config/config';

const router = Router();

router.post('/authcore', async (req, res, next) => {
  try {
    const {
      'x-authcore-event': authCoreEvent,
      'x-authcore-token': authCoreToken,
    } = req.headers;
    if (AUTHCORE_WEB_HOOK_SECRET && authCoreToken !== AUTHCORE_WEB_HOOK_SECRET) {
      res.status(401).send('INVALID_AUTHCORE_TOKEN');
      return;
    }
    const { data } = req.body;
    publisher.publish(PUBSUB_TOPIC_MISC, req, {
      logType: 'eventUserWebhook',
      platform: 'authcore',
      type: authCoreEvent,
      data,
    });
    if (authCoreEvent === 'UpdateUser' && data && data.user) {
      const {
        public_id: authcoreUserId,
        display_name: displayName,
        primary_email: email,
        primary_email_verified: isEmailVerified = false,
      } = data.user;
      const query = await dbRef.where('authCoreUserId', '==', authcoreUserId).limit(1).get();
      const [user] = query.docs;
      if (user) {
        await user.ref.update({
          email,
          displayName,
          isEmailVerified,
        });
      } else {
        res.status(404).send('USER_NOT_FOUND');
        return;
      }
      res.sendStatus(200);

      publisher.publish(PUBSUB_TOPIC_MISC, req, {
        logType: 'eventUserSyncWebHook',
        type: 'authcore',
        user,
        email,
        displayName,
      });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
