export const getActiveTabs = (): Promise<chrome.tabs.Tab[]> => {
  return new Promise((resolve, reject) => {
    chrome.tabs &&
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        (tabs) => {
          if (!tabs?.length) {
            return reject()
          }
          resolve(tabs)
        },
      )
  })
}
