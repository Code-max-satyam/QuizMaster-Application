import Result from "../models/resultModel.js";

// Create a new quiz result
export async function createResult(req, res) {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { title, technology, level, totalQuestions, correct, wrong } = req.body;

    if (!technology || !level || totalQuestions === undefined || correct === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is missing'
      });
    }

    // compute wrong if not provided
    const computedWrong = wrong !== undefined
      ? Number(wrong)
      : Math.max(0, Number(totalQuestions) - Number(correct));

    const payload = {
      title: String(title).trim(),
      technology,
      level,
      totalQuestions: Number(totalQuestions),
      correct: Number(correct),
      wrong: computedWrong,
      userId: req.user._id  // link result with logged-in user
    };

    const created = await Result.create(payload);
    return res.status(201).json({
      success: true,
      message: 'Result created successfully',
      result: created
    });

  } catch (err) {
    console.error('Create result error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}


// List all results for a user
export async function listResults(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { technology } = req.query;
    const query = { userId: req.user._id };

   
    if (technology && technology.toLowerCase() !== 'all') {
      query.technology = technology;
    }

    const items = await Result.find(query).sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      success: true,
      results: items
    });

  } catch (err) {
    console.error('ListResults error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}
