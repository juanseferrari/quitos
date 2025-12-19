#!/usr/bin/env python3
"""
Script to copy C2PA metadata chunks from tronoArg.png to reyinicio.png
to make it iOS Safari 17+ compatible
"""

import struct
import os

def read_png_chunks(filename):
    """Read PNG file and extract all chunks"""
    chunks = []
    with open(filename, 'rb') as f:
        # Skip PNG signature
        signature = f.read(8)
        if signature != b'\x89PNG\r\n\x1a\n':
            raise ValueError(f"Not a valid PNG file: {filename}")
        
        while True:
            # Read chunk length
            length_data = f.read(4)
            if len(length_data) < 4:
                break
            length = struct.unpack('>I', length_data)[0]
            
            # Read chunk type
            chunk_type = f.read(4)
            if len(chunk_type) < 4:
                break
            
            # Read chunk data
            chunk_data = f.read(length)
            
            # Read CRC
            crc = f.read(4)
            
            chunks.append({
                'type': chunk_type,
                'data': chunk_data,
                'length': length,
                'crc': crc
            })
            
            # Stop at IEND
            if chunk_type == b'IEND':
                break
    
    return chunks

def write_png_with_c2pa(source_chunks, target_file, output_file):
    """Write PNG with C2PA chunks from source"""
    target_chunks = read_png_chunks(target_file)
    
    # Find C2PA related chunks from source
    c2pa_chunks = []
    for chunk in source_chunks:
        chunk_type = chunk['type']
        # Look for C2PA metadata chunks
        if chunk_type in [b'caBX', b'jumb'] or b'c2pa' in chunk['data']:
            c2pa_chunks.append(chunk)
    
    print(f"Found {len(c2pa_chunks)} C2PA chunks to copy")
    
    # Write new PNG
    with open(output_file, 'wb') as f:
        # Write PNG signature
        f.write(b'\x89PNG\r\n\x1a\n')
        
        # Write chunks in order: IHDR, C2PA chunks, then other chunks except IEND, then IEND
        for chunk in target_chunks:
            if chunk['type'] == b'IHDR':
                # Write IHDR first
                f.write(struct.pack('>I', chunk['length']))
                f.write(chunk['type'])
                f.write(chunk['data'])
                f.write(chunk['crc'])
                
                # Then write C2PA chunks
                for c2pa_chunk in c2pa_chunks:
                    f.write(struct.pack('>I', c2pa_chunk['length']))
                    f.write(c2pa_chunk['type'])
                    f.write(c2pa_chunk['data'])
                    f.write(c2pa_chunk['crc'])
                    
            elif chunk['type'] != b'IEND':
                # Write other chunks (except IEND)
                f.write(struct.pack('>I', chunk['length']))
                f.write(chunk['type'])
                f.write(chunk['data'])
                f.write(chunk['crc'])
        
        # Write IEND last
        for chunk in target_chunks:
            if chunk['type'] == b'IEND':
                f.write(struct.pack('>I', chunk['length']))
                f.write(chunk['type'])
                f.write(chunk['data'])
                f.write(chunk['crc'])
                break

def main():
    # Source file with C2PA metadata
    source_file = "src/styles/assets/images/tronoArg.png"
    
    # Target file to add C2PA metadata to
    target_file = "src/styles/assets/images/reyinicio.png"
    
    if not os.path.exists(source_file):
        print(f"Source file not found: {source_file}")
        return
    
    if not os.path.exists(target_file):
        print(f"Target file not found: {target_file}")
        return
    
    print(f"Reading C2PA metadata from: {source_file}")
    source_chunks = read_png_chunks(source_file)
    
    # Create backup first
    backup_file = target_file.replace('.png', '_original.png')
    print(f"Creating backup: {backup_file}")
    
    import shutil
    shutil.copy2(target_file, backup_file)
    
    output_file = target_file.replace('.png', '_with_c2pa.png')
    print(f"Processing: {target_file} -> {output_file}")
    
    try:
        write_png_with_c2pa(source_chunks, target_file, output_file)
        print(f"✅ Created: {output_file}")
        
        # Replace original with C2PA version
        shutil.move(output_file, target_file)
        print(f"✅ Replaced original file with C2PA version")
        
    except Exception as e:
        print(f"❌ Error processing {target_file}: {e}")

if __name__ == "__main__":
    main()