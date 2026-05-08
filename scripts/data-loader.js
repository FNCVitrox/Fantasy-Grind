const loadedDataPacks = new Set();
const loadingDataPacks = new Map();
const dataPackSources = {
  achievements: "./scripts/data-achievements.js",
  drops: "./scripts/data-drops.js",
  i18nEn: "./scripts/i18n-en.js",
};

function markDataPackLoaded(key) {
  loadedDataPacks.add(key);
  loadingDataPacks.delete(key);
}

function isDataPackLoaded(key) {
  return loadedDataPacks.has(key);
}

function dataPackUrl(key) {
  const source = dataPackSources[key];
  return source ? `${source}?v=${assetVersion}` : "";
}

function loadDataPack(key) {
  if (isDataPackLoaded(key)) return Promise.resolve(true);
  if (loadingDataPacks.has(key)) return loadingDataPacks.get(key);

  const source = dataPackUrl(key);
  if (!source) return Promise.reject(new Error(`Unknown data pack: ${key}`));
  if (typeof document === "undefined" || !document.createElement) return Promise.resolve(false);

  const promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = source;
    script.async = true;
    script.onload = () => {
      markDataPackLoaded(key);
      resolve(true);
    };
    script.onerror = () => {
      loadingDataPacks.delete(key);
      reject(new Error(`Data pack could not be loaded: ${key}`));
    };
    document.head.appendChild(script);
  });

  loadingDataPacks.set(key, promise);
  return promise;
}

function loadDataPacks(keys) {
  return Promise.all(keys.map(loadDataPack));
}

async function loadOptionalDataPack(key) {
  try {
    await loadDataPack(key);
    return true;
  } catch (error) {
    console.warn(error);
    return false;
  }
}
