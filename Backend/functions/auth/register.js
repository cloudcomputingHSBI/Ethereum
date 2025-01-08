const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const parse = require('mrz').parse;

const prisma = new PrismaClient();

exports.registerUser = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method not allowed' });
  }

  const { name, email, password, mrzData } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const mrz = [
        'IDD<<L7MW6RWXZ7<<<<<<<<<<<<<<<',
        '0404066<2806066D<<2108<<<<<<<3',
        'ZAREMBA<<BJARNE<LINUS<<<<<<<<<',
      ];
      
      var result = parse(mrz);
      console.log(result.valid);

    // const user = await prisma.users.create({
    //   data: {
    //     name,
    //     email,
    //     password_hash: hashedPassword,
    //     mrz_data: mrzData,
    //     iserified: false,
    //   },
    // });

    res.status(201).json({ message: 'User registered', user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
