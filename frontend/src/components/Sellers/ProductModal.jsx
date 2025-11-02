import React, { useState, useRef } from 'react';
import { X, Upload, Save } from 'lucide-react';
import './../CSS/add_product.css';

const ProductModal = ({ show, onClose, newProduct, setNewProduct, onSave, categories, isEditing = false }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newStock, setNewStock] = useState('');
  const fileInputRef = useRef(null);
  if (!show) return null;
  
  const handleAddVariant = () => {
    if (!selectedSize || !newColor || !newStock) return;
    setNewProduct(prev => {
      const updatedVariants = [...prev.variants];
      const existingSize = updatedVariants.find(v => v.size === selectedSize);
      if (existingSize) {
        existingSize.options[newColor] = parseInt(newStock);
      } else { updatedVariants.push({
          size: selectedSize,
          options: { [newColor]: parseInt(newStock) }
        }); } return { ...prev, variants: updatedVariants };
    });setNewColor('');
    setNewStock('');
  };  
  
  const handleRemoveVariant = (size, color) => {
    setNewProduct(prev => {
      const updatedVariants = prev.variants
        .map(variant => {
          if (variant.size === size) {
            const updatedOptions = { ...variant.options };
            delete updatedOptions[color];
            return { ...variant, options: updatedOptions };
          } return variant;
        }).filter(variant => Object.keys(variant.options).length > 0);
      return { ...prev, variants: updatedVariants }; });
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    setNewProduct(prev => ({ ...prev, images: [...(prev.images || []), ...fileArray] }));
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div style={{ padding: '24px' }}>
          <div className="modal-header">
            <h2 className="modal-title">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
            <button onClick={onClose} className="close-button"><X style={{ height: '24px', width: '24px' }} /></button>
          </div>
          <div className="form-grid">
            <div className="form-section">
              
              <div className="two-col-grid">
                <div className="form-group">
                  <label className="form-label">Product Name*</label>
                  <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="form-input" placeholder="Enter product name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category*</label>
                  <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value, subcategory: ''})} className="form-select">
                    <option value="">Select Category</option>{Object.values(categories).map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="form-textarea" placeholder="Enter product description"/>
              </div>

              <div className="form-group">
                <label className="form-label">Product Images</label>
                <div className="upload-area" onClick={() => fileInputRef.current.click()}>
                  <Upload className="upload-icon" />
                   <p className="upload-text">{(newProduct.images?.length || 0) >= 5? 'Maximum Photos Uploaded' : 'Click to upload images'}</p>
                  <p className="upload-subtext">PNG, JPG, GIF up to 10MB</p>
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple accept="image/*" onChange={handleImageUpload} disabled={(newProduct.images?.length || 0) >= 5}/>
                </div>
              </div>
              <div className="preview-images">
                {newProduct.images && newProduct.images.map((file, idx) => (
                  <img key={idx} src={URL.createObjectURL(file)} alt={`preview-${idx}`} width="100" style={{ marginRight: '8px', borderRadius: '6px' }} />
                ))}
              </div>
            </div>
           
            <div className="form-section">
              
                <div className="form-group">
                  <label className="form-label">Price (₹)*</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="form-input"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

              <div className="form-section">
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <label className="form-label">Size</label>
                  {['S', 'M', 'L', 'XL'].map(size => (
                    <div
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: selectedSize === size ? '#4caf50' : '#ddd',
                        color: selectedSize === size ? '#fff' : '#333',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      {size}
                    </div>
                  ))}
                </div>

                <div className="two-col-grid">
                <label className="form-label">Colours Available*</label>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="Color"
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                  <label className="form-label">Stock*</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    placeholder="Stock"
                    className="form-input"
                    style={{ width: '120px' }}
                  />
                  <button type="button" onClick={handleAddVariant} className="save-button">
                    Add
                  </button>
                </div></div>

                <label className="form-label">Current Inventory*</label>
                <div style={{ marginTop: '10px' }}>
                  {newProduct.variants.map((variant) =>
                    Object.entries(variant.options).map(([color, stock]) => (
                      <div key={`${variant.size}-${color}`} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '6px',
                        marginBottom: '6px',
                        background: '#f7f7f7'
                      }}>
                        <span><strong>{variant.size}</strong> - {color} : {stock}</span>
                        <button
                          onClick={() => handleRemoveVariant(variant.size, color)}
                          style={{
                            border: 'none',
                            background: 'none',
                            color: 'red',
                            fontSize: '18px',
                            cursor: 'pointer'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button onClick={onSave} className="save-button">
              <Save style={{ height: '16px', width: '16px' }} />
              <span>{isEditing ? 'Update Product' : 'Save Product'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;