const { GoogleGenAI, Type } = require('@google/genai');
const User = require('../models/userModel.js');
const { UserRole } = require('../utils/userConstants.js');

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const suggestMentorsController = async (req, res) => {
  const { menteeId } = req.body;

  if (!process.env.API_KEY) {
      return res.status(500).json({ message: "AI service is not configured." });
  }

  try {
    const mentee = await User.findById(menteeId);
    if (!mentee || mentee.role !== UserRole.MENTEE) {
      return res.status(404).json({ message: 'Mentee not found' });
    }

    const allMentors = await User.find({ 
        role: UserRole.MENTOR,
        _id: { $nin: mentee.mentorIds } 
    }).select('name department skills interests bio position');

    if (allMentors.length === 0) {
        return res.json([]);
    }

    const prompt = `
      Based on the profile of this mentee and the list of available mentors, suggest the top 3 most suitable mentors.
      
      Mentee Profile:
      - Department: ${mentee.department}
      - Year: ${mentee.year}
      - Skills: ${mentee.skills.join(', ')}
      - Interests: ${mentee.interests.join(', ')}

      Available Mentors (JSON):
      ${JSON.stringify(allMentors.map(m => ({ id: m.id, name: m.name, department: m.department, skills: m.skills, interests: m.interests, bio: m.bio, position: m.position })), null, 2)}

      Return ONLY a JSON array containing just the string IDs of the top 3 recommended mentors. Example: ["60d5ecb8b48f4d3a7c8b4567", "60d5ecb8b48f4d3a7c8b4568", "60d5ecb8b48f4d3a7c8b4569"]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      },
    });
    
    const suggestedIds = JSON.parse(response.text);

    // Fetch the full mentor documents based on the suggested IDs, preserving the order from the AI.
    const suggestedMentors = await User.find({
        '_id': { $in: suggestedIds }
    }).select('-password');
    
    // Sort the results to match the order provided by the Gemini API
    const orderedMentors = suggestedIds.map(id => suggestedMentors.find(m => m.id.toString() === id)).filter(Boolean);
    
    res.json(orderedMentors);

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ message: 'Failed to get AI suggestions' });
  }
};

module.exports = {
    suggestMentorsController,
};
