import HomePage from '../models/HomePage.js';

// Get home page data
export const getHomePageData = async (req, res) => {
  try {
    let data = await HomePage.findOne();
    if (!data) {
      // Return empty or default data if none exists yet
      return res.status(404).json({ message: 'Home page data not found' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update home page data
export const updateHomePageData = async (req, res) => {
  try {
    let data = await HomePage.findOne();
    
    if (data) {
      data = await HomePage.findOneAndUpdate({}, req.body, { new: true });
    } else {
      data = await HomePage.create(req.body);
    }
    
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
