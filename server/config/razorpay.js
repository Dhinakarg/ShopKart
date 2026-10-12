import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config({ override: true });

export const getRazorpayKeyId = () => {
  dotenv.config({ override: true });
  return process.env.RAZORPAY_KEY_ID || 'rzp_test_Tm9TwY3GxTDMtI';
};

export const getRazorpayKeySecret = () => {
  dotenv.config({ override: true });
  return process.env.RAZORPAY_KEY_SECRET || 'BuOeFxCiYjcdnALu27lLmz1Q';
};

export const getRazorpayInstance = () => {
  dotenv.config({ override: true });
  const key_id = getRazorpayKeyId();
  const key_secret = getRazorpayKeySecret();

  try {
    return new Razorpay({
      key_id,
      key_secret
    });
  } catch (err) {
    console.warn('Razorpay instance warning:', err.message);
    return null;
  }
};

export const razorpayKeyId = getRazorpayKeyId();
export const razorpayKeySecret = getRazorpayKeySecret();

let defaultInstance = getRazorpayInstance();
export default defaultInstance;
