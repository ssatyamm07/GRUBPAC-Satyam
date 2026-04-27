import * as contentService from '../services/contentService.js';

export const uploadContent = async (req, res) => {
  try {
    const result = await contentService.uploadContent(req);

    res.status(201).json({
      message: 'Content uploaded successfully',
      data: result,
    });

  } catch (err) {
    console.error('Upload error:', err.message);

    res.status(400).json({
      error: err.message,
    });
  }
};

export const getMyUploads = async (req, res) => {
  try {
    const data = await contentService.getMyUploads(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateContentWindow = async (req, res) => {
  try {
    const data = await contentService.updateContentWindow(
      req.user.id,
      req.params.id,
      req.body
    );
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};