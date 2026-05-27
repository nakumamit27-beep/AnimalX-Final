import React, { useState } from 'react';
import { db } from '../utils/firebase';
import { collection, addDoc } from 'firebase/firestore';

const AdminPanel = () => {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    if(!name || !imageUrl) return alert("Pehle Name aur Photo Link dalo!");
    
    try {
      await addDoc(collection(db, "animals"), { 
        name, 
        imageUrl, 
        description,
        createdAt: new Date() 
      });
      alert("Animal Saved with Link! 🔥");
      setName(''); setImageUrl(''); setDescription('');
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <h2>🦁 Add Animal (Link System)</h2>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="text" placeholder="Animal Name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        
        {/* Ye hai link wala dabba */}
        <input type="text" placeholder="Google se Photo Link (URL) yahan paste karein" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} style={inputStyle} />
        
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} style={inputStyle} />
        
        <button type="submit" style={btnStyle}>Save Animal to App</button>
      </form>
      <p style={{marginTop: '20px', fontSize: '12px', color: '#888'}}>*Photo Link copy karne ke liye Google par photo par long-press karein aur "Copy Image Address" chunein.</p>
    </div>
  );
};

const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #444', background: '#333', color: 'white' };
const btnStyle = { padding: '12px', background: '#00ff88', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' };

export default AdminPanel;
