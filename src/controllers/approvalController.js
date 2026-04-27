import * as approvalService from '../services/approvalService.js';

export const getAll = async (req, res) => {
  try {
    const data = await approvalService.getAllContent();
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getPending = async (req, res) => {
  try {
    const data = await approvalService.getPendingContent();
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const approve = async (req, res) => {
  try {
    const content = await approvalService.approveContent(
      req.params.id,
      req.user.id
    );
    res.json(content);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const reject = async (req, res) => {
  try {
    const content = await approvalService.rejectContent(
      req.params.id,
      req.body.reason
    );
    res.json(content);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};