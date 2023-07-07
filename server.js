// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Initialize Express app
const app = express();

// Body parser middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/node_code', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Create User schema
const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});

// Create User model
const User = mongoose.model('user', UserSchema);

// Create UserDetails schema
const UserDetailsSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  phoneNo: String,
  username: String,
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }
});

// Create UserDetails model
const UserDetails = mongoose.model('userdetails', UserDetailsSchema);


app.get('/', function (req, res) {
    res.send('Welcome TO KARKINOS EDGE M-HEALTH');
  });

// Register API
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, firstname, lastname, email, phoneNo } = req.body;

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const user = new User({ username, password: hashedPassword });
    await user.save();

    // Create user details
    const userDetails = new UserDetails({
      firstname,
      lastname,
      email,
      phoneNo,
      username,
      user_id: user._id
    });
    await userDetails.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
  }
});

// Login API
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
  }
});

// Change Password API
app.post('/api/change-password', async (req, res) => {
    try {
      const { username, currentPassword, newPassword } = req.body;
  
      // Check if username exists
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
  
      // Compare current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid current password' });
      }
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      // Update the password
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred' });
    }
  });

// Start the server
const port = 7000;
app.listen(port, () => console.log(`Server started on port ${port}`));
