const config = {};

config.FIRESTORE_USER_ROOT = process.env.FIRESTORE_USER_ROOT;
config.FIRESTORE_USER_AUTH_ROOT = process.env.FIRESTORE_USER_AUTH_ROOT;
config.FIRESTORE_SUBSCRIPTION_USER_ROOT = process.env.FIRESTORE_SUBSCRIPTION_USER_ROOT;
config.FIRESTORE_TX_ROOT = process.env.FIRESTORE_TX_ROOT;
config.FIRESTORE_IAP_ROOT = process.env.FIRESTORE_IAP_ROOT;
config.FIRESTORE_PAYOUT_ROOT = process.env.FIRESTORE_PAYOUT_ROOT;
config.FIRESTORE_MISSION_ROOT = process.env.FIRESTORE_MISSION_ROOT;
config.FIRESTORE_CONFIG_ROOT = process.env.FIRESTORE_CONFIG_ROOT;
config.FIRESTORE_COUPON_ROOT = process.env.FIRESTORE_COUPON_ROOT;
config.FIRESTORE_OAUTH_CLIENT_ROOT = process.env.FIRESTORE_OAUTH_CLIENT_ROOT;
config.FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET;

config.COSMOS_LCD_ENDPOINT = 'localhost:1317';
config.COSMOS_CHAIN_ID = 'likechain-cosmos-testnet-2';
config.COSMOS_DENOM = 'nanolike';

config.AUTHCORE_API_ENDPOINT = '';

config.JWT_PUBLIC_CERT_PATH = '';
config.JWT_PRIVATE_KEY_PATH = '';
config.PROVIDER_JWT_COMMON_SECRET = '';

config.INTERCOM_USER_HASH_SECRET = '';

config.TWITTER_CONSUMER_KEY = '';
config.TWITTER_CONSUMER_SECRET = '';
config.TWITTER_ACCESS_TOKEN = '';
config.TWITTER_ACCESS_TOKEN_SECRET = '';

config.TWITTER_API_KEY = '';
config.TWITTER_API_SECRET = '';

config.FACEBOOK_APP_ID = '';
config.FACEBOOK_APP_SECRET = '';

config.FLICKR_APP_KEY = '';
config.FLICKR_APP_SECRET = '';

config.MEDIUM_APP_ID = '';
config.MEDIUM_APP_SECRET = '';

config.MATTERS_APP_ID = '';
config.MATTERS_APP_SECRET = '';

config.REGISTER_LIMIT_WINDOW = 3600000; // 1hour
config.REGISTER_LIMIT_COUNT = 0; // 0 = disable
config.NEW_USER_BONUS_COOLDOWN = 259200000; // 3 days

config.GCLOUD_PUBSUB_MAX_MESSAGES = 10;
config.GCLOUD_PUBSUB_MAX_WAIT = 1000;
config.GCLOUD_PUBSUB_ENABLE = false;
config.APP_SERVER = 'likecoin-api-pulic';

config.CMC_PRO_API_KEY = '';

module.exports = config;
