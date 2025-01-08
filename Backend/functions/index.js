const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.registerUser = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method not allowed' });
  }

  const { name, email, password, mrzData } = req.body;

  try {

    console.log(req.body);
    const user = await prisma.users.create({
      data: {
        name,
        email,
        password, // Hashing sollte hier erfolgen
        mrzData,
        isVerified: false,
      },
    });

    res.status(201).json({ message: 'User registered', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
