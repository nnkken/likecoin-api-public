import axios from 'axios';
import bodyParser from 'body-parser';
import { Router } from 'express';

import {
  MEDIUM_REGEX,
  PUBSUB_TOPIC_MISC,
} from '../../constant';
import { COSMOS_LCD_ENDPOINT, amountToLIKE } from '../../util/cosmos';
import { fetchPaymentUserInfo } from '../../util/api/payment';
import { logCosmosTx } from '../../util/txLogger';
import publisher from '../../util/gcloudPub';

const proxy = require('express-http-proxy');

/* This file is a middleware for logging before passing request to cosmos LCD API */
const router = Router();

router.use(bodyParser.json({ type: 'text/plain' }));

router.post('/bank/accounts/:address/transfers', async (req, res, next) => {
  try {
    const {
      amount: [amount],
      from_address: from,
      to_address: to,
      httpReferrer,
    } = req.body;
    const {
      fromId,
      fromDisplayName,
      fromEmail,
      fromReferrer,
      fromLocale,
      fromRegisterTime,
      toId,
      toDisplayName,
      toEmail,
      toReferrer,
      toLocale,
      toRegisterTime,
    } = await fetchPaymentUserInfo({ from, to, type: 'cosmos' });
    publisher.publish(PUBSUB_TOPIC_MISC, req, {
      logType: 'eventSimulatePayCosmos',
      fromUser: fromId,
      fromWallet: from,
      fromDisplayName,
      fromEmail,
      fromReferrer,
      fromLocale,
      fromRegisterTime,
      toUser: toId,
      toWallet: to,
      toDisplayName,
      toEmail,
      toReferrer,
      toLocale,
      toRegisterTime,
      likeAmount: amountToLIKE(amount),
      likeAmountUnitStr: amountToLIKE(amount).toString(),
      sourceURL: httpReferrer,
    });
    next();
  } catch (err) {
    next(err);
  }
});

async function handlePostTxReq(reqData, resData, req) {
  const {
    tx: {
      msg,
      fee: {
        amount: feeAmount,
        gas,
      },
      memo,
      signatures: [{
        account_number: accountNumber,
        sequence,
      }],
    },
    mode,
    httpReferrer,
    userPayload,
  } = reqData;
  const { txhash: txHash } = resData;
  const { type, value: payloadValue } = msg[0];
  if (type === 'cosmos-sdk/MsgSend') {
    const {
      amount: [amount],
      from_address: from,
      to_address: to,
    } = payloadValue;

    const {
      fromId,
      fromDisplayName,
      fromEmail,
      fromReferrer,
      fromLocale,
      fromRegisterTime,
      toId,
      toDisplayName,
      toEmail,
      toReferrer,
      toLocale,
      toRegisterTime,
      toSubscriptionURL,
    } = await fetchPaymentUserInfo({ from, to, type: 'cosmos' });

    const txRecord = {
      txHash,
      feeAmount,
      gas,
      memo,
      accountNumber,
      sequence,
      mode,
      from,
      to,
      fromId: fromId || null,
      toId: toId || null,
      amount,
      rawPayload: JSON.stringify(reqData),
    };

    /* temp hack to handle medium referrer */
    if (httpReferrer) {
      let targetURL = httpReferrer;
      if (!memo) {
        const match = (decodeURIComponent(targetURL) || '').match(MEDIUM_REGEX);
        if (match && match[1]) {
          targetURL = `https://medium.com/p/${match[1]}`;
          txRecord.remarks = `@LikeCoin Widget: ${targetURL}`;
        }
      }
      try {
        new URL(targetURL); // eslint-disable-line
        txRecord.httpReferrer = targetURL;
      } catch (err) {
        // no op
      }
    }

    await logCosmosTx(txRecord);
    const status = 'pending';
    if (toSubscriptionURL) {
      try {
        await axios.post(toSubscriptionURL, {
          from,
          status,
          to,
          txHash,
          value: amountToLIKE(amount),
          amount,
          userPayload,
        });
      } catch (err) {
        console.error(err); // eslint-disable-line no-console
      }
    }

    publisher.publish(PUBSUB_TOPIC_MISC, req, {
      logType: 'eventPayCosmos',
      fromUser: fromId,
      fromWallet: from,
      fromDisplayName,
      fromEmail,
      fromReferrer,
      fromLocale,
      fromRegisterTime,
      toUser: toId,
      toWallet: to,
      toDisplayName,
      toEmail,
      toReferrer,
      toLocale,
      toRegisterTime,
      likeAmount: amountToLIKE(amount),
      likeAmountUnitStr: amountToLIKE(amount).toString(),
      txHash,
      txStatus: status,
      sourceURL: httpReferrer,
    });
  }
}

router.use(proxy(COSMOS_LCD_ENDPOINT, {
  userResDecorator: async (proxyRes, proxyResData, userReq) => {
    if (userReq.method === 'POST') {
      if (proxyRes.statusCode >= 200 && proxyRes.statusCode <= 299) {
        switch (userReq.path) {
          case '/txs': {
            await handlePostTxReq(userReq.body, JSON.parse(proxyResData.toString('utf8')), userReq);
            break;
          }
          default: break;
        }
      }
    }
    return proxyResData;
  },
}));

export default router;