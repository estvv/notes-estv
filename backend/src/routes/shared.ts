import { Router } from 'express';
import { getNoteByShareToken } from '../db/index.js';

const router = Router();

router.get('/:token', (req, res) => {
  const note = getNoteByShareToken(req.params.token);
  
  if (!note) {
    return res.status(404).json({ success: false, error: 'Shared note not found' });
  }
  
  res.json({ 
    success: true, 
    data: { 
      title: note.title, 
      content: note.content 
    } 
  });
});

export default router;