import test from 'ava';
import {
  testingUser1,
  testingUser2,
} from './data';
import axiosist from './axiosist';

const { jwtSign } = require('./jwt');

test('MISSION: Get mission list', async (t) => {
  const user = testingUser1;
  const token = jwtSign({ user });
  const res = await axiosist.get(`/api/mission/list/${user}`, {
    headers: {
      Cookie: `likecoin_auth=${token}`,
    },
  }).catch(err => err.response);
  t.is(res.status, 200);
  t.true(res.data.length > 0);
  for (let i = 0; i < res.data.length; i += 1) {
    if (res.data[i].id === 'verifyEmail') {
      t.false(res.data[i].isClaimed);
      t.is(res.data[i].refereeReward, '8 LIKE');
    }
  }
});

test('MISSION: See mission', async (t) => {
  const user = testingUser1;
  const missionId = 'gettingStart';
  const token = jwtSign({ user });
  const res = await axiosist.post(`/api/mission/seen/${missionId}`, {
    user,
  }, {
    headers: {
      Cookie: `likecoin_auth=${token}`,
    },
  }).catch(err => err.response);
  t.is(res.status, 200);
});

test('MISSION: Hide mission. Case: not hidable', async (t) => {
  const user = testingUser1;
  const missionId = 'gettingStart';
  const token = jwtSign({ user });
  const res = await axiosist.post(`/api/mission/hide/${missionId}`, {
    user,
  }, {
    headers: {
      Cookie: `likecoin_auth=${token}`,
    },
  }).catch(err => err.response);
  t.is(res.status, 400);
  t.is(res.data, 'mission not hidable');
});

test('MISSION: Finish step mission. Case: success', async (t) => {
  const user = testingUser1;
  const missionId = 'gettingStart';
  const taskId = 'taskVideo';
  const token = jwtSign({ user });
  const res = await axiosist.post(`/api/mission/step/${missionId}`, {
    user,
    taskId,
  }, {
    headers: {
      Cookie: `likecoin_auth=${token}`,
    },
  }).catch(err => err.response);
  t.is(res.status, 200);
});

test('MISSION: Finish step mission. Case: Unknown mission', async (t) => {
  const user = testingUser1;
  const missionId = 'telegram'; // undefined mission
  const taskId = 'taskVideo';
  const token = jwtSign({ user });
  const res = await axiosist.post(`/api/mission/step/${missionId}`, {
    user,
    taskId,
  }, {
    headers: {
      Cookie: `likecoin_auth=${token}`,
    },
  }).catch(err => err.response);
  t.is(res.status, 400);
});

test('MISSION: Finish step mission. Case: Unknown task', async (t) => {
  const user = testingUser1;
  const missionId = 'gettingStart';
  const taskId = 'taskTelegram'; // undefined mission
  const token = jwtSign({ user });
  const res = await axiosist.post(`/api/mission/step/${missionId}`, {
    user,
    taskId,
  }, {
    headers: {
      Cookie: `likecoin_auth=${token}`,
    },
  }).catch(err => err.response);
  t.is(res.status, 400);
});

test('MISSION: Get mission history', async (t) => {
  const user = testingUser1;
  const token = jwtSign({ user });
  const res = await axiosist.get(`/api/mission/list/history/${user}`, {
    headers: {
      Cookie: `likecoin_auth=${token}`,
    },
  }).catch(err => err.response);
  t.is(res.status, 200);
  let hasVerifyEmail;
  let hasGettingStart;
  for (let i = 0; i < res.data.length; i += 1) {
    if (res.data[i].id === 'verifyEmail') {
      hasVerifyEmail = true;
    }
    if (res.data[i].id === 'gettingStart') {
      hasGettingStart = true;
    }
  }
  t.true(hasVerifyEmail && hasGettingStart);
});

test('MISSION: Get mission history bonus', async (t) => {
  const user = testingUser1;
  const token = jwtSign({ user });
  const res = await axiosist.get(`/api/mission/list/history/${user}/bonus`, {
    headers: {
      Cookie: `likecoin_auth=${token}`,
    },
  }).catch(err => err.response);
  t.is(res.status, 200);
  let hasGettingStart;
  if (parseFloat(res.data['mission-gettingStart']) === 3.0) {
    hasGettingStart = true;
  }
  t.true(hasGettingStart);
});


test('MISSION: Get mission data by missionId', async (t) => {
  const user = testingUser1;
  const token = jwtSign({ user });
  let res = await axiosist.get(`/api/mission/gettingStart/user/${user}`)
    .catch(err => err.response);
  t.is(res.status, 401);

  res = await axiosist.get(`/api/mission/gettingStart/user/${user}`, {
    headers: {
      Cookie: `likecoin_auth=${token}`,
    },
  }).catch(err => err.response);
  t.is(res.status, 200);
  t.is(res.data.id, 'gettingStart');
});

test('MISSION: Get referral list', async (t) => {
  const user = testingUser1;
  const token = jwtSign({ user });
  const res = await axiosist.get(`/api/referral/list/${user}`, {
    headers: {
      Cookie: `likecoin_auth=${token}`,
    },
  }).catch(err => err.response);
  t.is(res.status, 200);
  let hasReferral;
  for (let i = 0; i < res.data.length; i += 1) {
    if (res.data[i].id === testingUser2) {
      hasReferral = true;
    }
  }
  t.true(hasReferral);
});

test('MISSION: Get referral list bonus', async (t) => {
  const user = testingUser1;
  const token = jwtSign({ user });
  const res = await axiosist.get(`/api/referral/list/bonus/${user}`, {
    headers: {
      Cookie: `likecoin_auth=${token}`,
    },
  }).catch(err => err.response);
  t.is(res.status, 200);
  let hasReferral;
  for (let i = 0; i < res.data.length; i += 1) {
    if (res.data[i].referrer === user || res.data[i].referee === user) {
      hasReferral = true;
    }
  }
  t.true(hasReferral);
});

test('MISSION: See referral', async (t) => {
  const user = testingUser1;
  const token = jwtSign({ user });
  const res = await axiosist.post(`/api/referral/seen/${user}`, {
    referralId: testingUser2,
  }, {
    headers: {
      Cookie: `likecoin_auth=${token}`,
    },
  }).catch(err => err.response);
  t.is(res.status, 200);
});
