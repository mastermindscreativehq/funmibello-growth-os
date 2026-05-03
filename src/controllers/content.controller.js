const { generateContentIdeas } = require('../services/contentIdea.service');

const generateIdeas = async (req, res) => {
  try {
    const result = await generateContentIdeas(req.body);

    return res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("CONTROLLER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
      debug: {
        stack: error.stack
      }
    });
  }
};

module.exports = {
  generateIdeas
};