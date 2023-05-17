import { createTransport } from 'nodemailer';

const transportConfig = {
  service: 'Gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS,
  },
};

export const mailTransporter = createTransport(transportConfig);
