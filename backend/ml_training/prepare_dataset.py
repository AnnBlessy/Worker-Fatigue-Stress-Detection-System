import os
import cv2
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from tqdm import tqdm

def prepare_fer2013_folders():
    """
    Prepare FER-2013 dataset from folder structure
    
    Download from: https://www.kaggle.com/datasets/msambare/fer2013
    
    Expected structure:
    fer2013/
    ├── train/
    │   ├── angry/
    │   ├── disgust/
    │   ├── fear/
    │   ├── happy/
    │   ├── sad/
    │   ├── surprise/
    │   └── neutral/
    └── test/
        ├── angry/
        ├── disgust/
        ├── fear/
        ├── happy/
        ├── sad/
        ├── surprise/
        └── neutral/
    """
    
    print("🔄 Loading FER-2013 dataset from folders...")
    
    # Emotion mapping to our 3 classes
    emotion_mapping = {
        'angry': 1,      # Stress
        'disgust': 1,    # Stress
        'fear': 1,       # Stress
        'happy': 2,      # Normal
        'sad': 0,        # Fatigue
        'surprise': 2,   # Normal
        'neutral': 0     # Fatigue
    }
    
    class_names = ['Fatigue', 'Stress', 'Normal']
    
    def load_images_from_folder(base_path):
        """Load all images from emotion folders"""
        images = []
        labels = []
        
        for emotion_folder in emotion_mapping.keys():
            folder_path = os.path.join(base_path, emotion_folder)
            
            if not os.path.exists(folder_path):
                print(f"⚠️  Warning: {folder_path} not found, skipping...")
                continue
            
            print(f"📁 Loading {emotion_folder}...")
            
            image_files = [f for f in os.listdir(folder_path) 
                          if f.endswith(('.jpg', '.png', '.jpeg'))]
            
            for img_file in tqdm(image_files, desc=f"  {emotion_folder}"):
                img_path = os.path.join(folder_path, img_file)
                
                # Read image in grayscale
                img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
                
                if img is None:
                    continue
                
                # Resize to 48x48 if needed
                if img.shape != (48, 48):
                    img = cv2.resize(img, (48, 48))
                
                images.append(img)
                labels.append(emotion_mapping[emotion_folder])
        
        return np.array(images), np.array(labels)
    
    # Load training data
    print("\n📦 Loading TRAIN set...")
    X_train, y_train = load_images_from_folder('fer2013/train')
    
    # Load test data
    print("\n📦 Loading TEST set...")
    X_test, y_test = load_images_from_folder('fer2013/test')
    
    # Reshape and normalize
    X_train = X_train.reshape(-1, 48, 48, 1) / 255.0
    X_test = X_test.reshape(-1, 48, 48, 1) / 255.0
    
    print("\n✅ Dataset loaded successfully!")
    print(f"   Training samples: {len(X_train)}")
    print(f"   Test samples: {len(X_test)}")
    print(f"\n   Class mapping:")
    print(f"   0 = Fatigue (sad, neutral)")
    print(f"   1 = Stress (angry, disgust, fear)")
    print(f"   2 = Normal (happy, surprise)")
    
    # Display class distribution
    print(f"\n   Training distribution:")
    for i, name in enumerate(class_names):
        count = np.sum(y_train == i)
        percentage = (count / len(y_train)) * 100
        print(f"   {name}: {count} ({percentage:.1f}%)")
    
    # Save processed data
    print("\n💾 Saving processed data...")
    os.makedirs('processed_data', exist_ok=True)
    
    np.save('processed_data/X_train.npy', X_train)
    np.save('processed_data/X_test.npy', X_test)
    np.save('processed_data/y_train.npy', y_train)
    np.save('processed_data/y_test.npy', y_test)
    
    print("✅ Data saved to processed_data/")
    
    return X_train, X_test, y_train, y_test

if __name__ == "__main__":
    X_train, X_test, y_train, y_test = prepare_fer2013_folders()


def load_data(split="test"):
    """
    Load processed data from `processed_data/`.

    If processed files do not exist, this will invoke
    `prepare_fer2013_folders()` to create them.

    Args:
        split (str): 'train' or 'test' (default 'test').

    Returns:
        tuple: (X, y) for the requested split. `y` is returned as
               one-hot encoded array with shape (n_samples, 3).
    """
    data_dir = Path(__file__).parent / 'processed_data'

    if not data_dir.exists():
        print("Processed data not found — preparing dataset now...")
        prepare_fer2013_folders()

    X_train = np.load(data_dir / 'X_train.npy')
    X_test = np.load(data_dir / 'X_test.npy')
    y_train = np.load(data_dir / 'y_train.npy')
    y_test = np.load(data_dir / 'y_test.npy')

    # Ensure labels are one-hot encoded for downstream code that expects it
    num_classes = 3
    def _to_one_hot(y):
        if y.ndim == 1 or (y.ndim == 2 and y.shape[1] == 1):
            return np.eye(num_classes)[y.reshape(-1)]
        return y

    y_train = _to_one_hot(y_train)
    y_test = _to_one_hot(y_test)

    if split == "train":
        return X_train, y_train
    if split == "test":
        return X_test, y_test
    if split == "all":
        return X_train, X_test, y_train, y_test

    raise ValueError("split must be one of 'train', 'test', or 'all'")