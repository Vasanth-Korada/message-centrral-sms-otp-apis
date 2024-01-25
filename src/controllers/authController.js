const NodeCache = require('node-cache');
const request = require('request');
const util = require('util');
const requestPromise = util.promisify(require('request-promise-native'));

const myCache = new NodeCache();
const key = 'authToken';
const expirationSeconds = 7 * 24 * 60 * 60;
const apiBaseUrl = "https://api-prod.messagecentral.com"
const customerId = "C-355EDC25ACCB46E"

function storeStringWithExpiration(key, value, expirationSeconds) {
  const expirationTime = expirationSeconds * 1000;
  myCache.set(key, value, expirationTime);

  setTimeout(() => {
    myCache.del(key);
    console.log(`Key '${key}' expired and was removed from the cache.`);
  }, expirationTime);
}

function getStringFromCache(key) {
  return myCache.get(key);
}

const getAuthToken = async () => {
  var authToken = getStringFromCache(key);
  if (authToken === undefined || authToken === null) {
    const options = {
      method: 'GET',
      uri: `${apiBaseUrl}/auth/v1/authentication/token?country=IN&customerId=${customerId}&key=VmFzYW50aEAxOTk5&scope=NEW`,
      headers: {
        accept: '*/*'
      }
    };

    try {
      const response = await requestPromise(options); 
      const token = JSON.parse(response.body)["token"];
      storeStringWithExpiration(key, token, expirationSeconds);
      authToken = token;
      console.log(myCache.get(key));
    } catch (error) {
      throw new Error(error);
    }

    return authToken;
  } else {
    console.log(authToken);
    return authToken;
  }
};

const sendOtp = async (req, res) => {
  const phoneNumber = req.body["phoneNumber"]
  const authToken = await getAuthToken()

  const options = {
    method: 'POST',
    url:
      `${apiBaseUrl}/verification/v2/verification/send?countryCode=91&customerId=${customerId}&flowType=SMS&mobileNumber=${phoneNumber}`,
    headers: {
      'authToken': authToken
    }
  };

  console.log(options)

  request(options, (error, response) => {
    if (error) {
      res.status(404).send({ "message": "Unable to send Otp" })
      throw new Error(error)
    };
    console.log(response.body)
    res.status(200).send({ "data": JSON.parse(response.body)["data"] })
  });
}

const verifyOtp = async (req, res) => {
  const verificationId = req.body["verificationId"]
  const phoneNumber = req.body["phoneNumber"]
  const otp = req.body["otp"]
  const authToken = await getAuthToken()
  const options = {
    method: 'GET',
    url:
      `${apiBaseUrl}/verification/v2/verification/validateOtp?country
    Code=91&mobileNumber=${phoneNumber}&verificationId=${verificationId}&customerId=${customerId}&code=${otp}`,
    headers: {
      'authToken': authToken
    }
  };
  console.log(options)
  request(options, async (error, response) => {
    if (error) {
      res.status(404).send({ "message": "Otp verification failed" })
      throw new Error(error)
    };
    res.status(200).send({ "data": JSON.parse(response.body)["data"] })
  });
};

module.exports = {
  sendOtp,
  verifyOtp
};
