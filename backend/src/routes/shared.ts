import { Router } from 'express';
import { getNoteByShareToken, getFolderByShareToken, getNotesByFolder, getChildFolders } from '../db/index.js';

const router = Router();

router.get('/:token', (req, res) => {
  const note = getNoteByShareToken(req.params.token);
  
  if (note) {
    return res.json({ 
      success: true, 
      data: { 
        type: 'note',
        title: note.title, 
        content: note.content 
      } 
    });
  }
  
  const folder = getFolderByShareToken(req.params.token);
  
  if (folder) {
    const notes = getNotesByFolder(folder.id);
    const childFolders = getChildFolders(folder.id);
    
    return res.json({
      success: true,
      data: {
        type: 'folder',
        folder: {
          id: folder.id,
          name: folder.name
        },
        notes: notes.map(n => ({
          id: n.id,
          title: n.title,
          content: n.content,
          updated_at: n.updated_at
        })),
        childFolders: childFolders.map(f => ({
          id: f.id,
          name: f.name,
          share_token: f.share_token,
          is_shared: f.is_shared
        }))
      }
    });
  }
  
  res.status(404).json({ success: false, error: 'Shared content not found' });
});

export default router;