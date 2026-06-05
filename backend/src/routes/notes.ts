import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { validateContent } from '../middleware/contentLimit.js';
import { getNotes, getNoteById, createNote, updateNote, deleteNote, generateShareToken, disableSharing } from '../db/index.js';

const router = Router();

router.use(authMiddleware);

router.get('/', (req: AuthRequest, res) => {
  const search = req.query.search as string;
  const folderId = req.query.folder_id ? parseInt(req.query.folder_id as string) : undefined;
  
  const notes = getNotes(folderId, search);
  res.json({ success: true, data: notes });
});

router.post('/', validateContent, (req: AuthRequest, res) => {
  const { title, content, folder_id } = req.body;
  
  if (!title) {
    return res.status(400).json({ success: false, error: 'Title required' });
  }
  
  const note = createNote(title, content || '', folder_id);
  res.json({ success: true, data: note });
});

router.get('/:id', (req: AuthRequest, res) => {
  const note = getNoteById(parseInt(req.params.id));
  
  if (!note) {
    return res.status(404).json({ success: false, error: 'Note not found' });
  }
  
  res.json({ success: true, data: note });
});

router.put('/:id', validateContent, (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const { title, content, folder_id } = req.body;
  
  const updates: any = {};
  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;
  if (folder_id !== undefined) updates.folder_id = folder_id;
  
  const note = updateNote(id, updates);
  res.json({ success: true, data: note });
});

router.delete('/:id', (req: AuthRequest, res) => {
  deleteNote(parseInt(req.params.id));
  res.json({ success: true });
});

router.post('/:id/share', (req: AuthRequest, res) => {
  const token = generateShareToken(parseInt(req.params.id));
  res.json({ success: true, data: { share_token: token } });
});

router.delete('/:id/share', (req: AuthRequest, res) => {
  disableSharing(parseInt(req.params.id));
  res.json({ success: true });
});

export default router;