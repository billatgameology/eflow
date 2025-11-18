const STORAGE_KEY = 'eflow_diagrams';
const AUTOSAVE_KEY = 'eflow_autosave';

export function saveDiagramToLocalStorage(diagram) {
  try {
    const diagrams = getAllDiagrams();
    const index = diagrams.findIndex((d) => d.id === diagram.id);

    if (index >= 0) {
      diagrams[index] = diagram;
    } else {
      diagrams.push(diagram);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(diagrams));
    return true;
  } catch (error) {
    console.error('Failed to save diagram:', error);
    return false;
  }
}

export function getAllDiagrams() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load diagrams:', error);
    return [];
  }
}

export function getDiagramById(id) {
  const diagrams = getAllDiagrams();
  return diagrams.find((d) => d.id === id);
}

export function deleteDiagram(id) {
  const diagrams = getAllDiagrams();
  const filtered = diagrams.filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function exportDiagramToFile(diagram) {
  const dataStr = JSON.stringify(diagram, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${diagram.name.replace(/\s/g, '_')}_${diagram.id}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

export function importDiagramFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const diagram = JSON.parse(e.target.result);

        // Validate diagram structure
        if (!diagram.id || !diagram.name || !diagram.nodes || !diagram.edges) {
          reject(new Error('Invalid diagram file structure'));
          return;
        }

        resolve(diagram);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Auto-save functionality
export function autoSave(diagram) {
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(diagram));
  } catch (error) {
    console.error('Auto-save failed:', error);
  }
}

export function loadAutoSave() {
  try {
    const data = localStorage.getItem(AUTOSAVE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
}

export function clearAutoSave() {
  try {
    localStorage.removeItem(AUTOSAVE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear auto-save:', error);
    return false;
  }
}
