"""
Dataset service for handling CSV file operations.

This module provides functionality to:
- List available CSV datasets
- Get dataset metadata (size, samples, columns)
- Read dataset content
"""

import os
import csv
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
import hashlib

class DatasetService:
    """Service for managing CSV datasets."""
    
    def __init__(self, dataset_dir: str = "dataset"):
        self.dataset_dir = Path(dataset_dir)
        self.dataset_dir.mkdir(exist_ok=True)
    
    def list_datasets(self) -> List[Dict[str, Any]]:
        """List all available CSV datasets with metadata."""
        datasets = []
        
        if not self.dataset_dir.exists():
            return datasets
        
        for csv_file in self.dataset_dir.glob("*.csv"):
            try:
                dataset_info = self._get_dataset_info(csv_file)
                datasets.append(dataset_info)
            except Exception as e:
                print(f"Error reading dataset {csv_file}: {e}")
                continue
        
        return datasets
    
    def get_dataset_by_id(self, dataset_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific dataset by ID."""
        datasets = self.list_datasets()
        for dataset in datasets:
            if dataset["id"] == dataset_id:
                return dataset
        return None
    
    def get_dataset_content(self, dataset_id: str, limit: int = 100) -> Optional[Dict[str, Any]]:
        """Get dataset content with optional row limit."""
        dataset = self.get_dataset_by_id(dataset_id)
        if not dataset:
            return None
        
        csv_file = self.dataset_dir / dataset["filename"]
        if not csv_file.exists():
            return None
        
        try:
            with open(csv_file, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                rows = []
                for i, row in enumerate(reader):
                    if i >= limit:
                        break
                    rows.append(row)
                
                return {
                    "dataset": dataset,
                    "columns": dataset["columns"],
                    "rows": rows,
                    "total_rows": dataset["samples"],
                    "returned_rows": len(rows)
                }
        except Exception as e:
            print(f"Error reading dataset content: {e}")
            return None
    
    def _get_dataset_info(self, csv_file: Path) -> Dict[str, Any]:
        """Extract metadata from a CSV file."""
        file_stat = csv_file.stat()
        
        # Read first few rows to get column information
        with open(csv_file, 'r', encoding='utf-8') as file:
            reader = csv.reader(file)
            header = next(reader, [])
            
            # Count total rows (including header)
            row_count = 1  # Header row
            for _ in reader:
                row_count += 1
        
        # Generate unique ID based on filename and modification time
        id_string = f"{csv_file.name}_{file_stat.st_mtime}"
        dataset_id = hashlib.md5(id_string.encode()).hexdigest()[:8]
        
        # Create human-readable name from filename
        name = csv_file.stem.replace('_', ' ').title()
        
        return {
            "id": dataset_id,
            "name": name,
            "filename": csv_file.name,
            "size": file_stat.st_size,
            "samples": row_count - 1,  # Exclude header
            "columns": header,
            "createdAt": datetime.fromtimestamp(file_stat.st_ctime).isoformat(),
            "description": f"CSV dataset with {row_count - 1} samples and {len(header)} columns"
        } 