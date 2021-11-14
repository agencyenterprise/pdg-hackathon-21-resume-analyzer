const scrollPage = async (ibody) => {
  for (let i = 0; i < 6; ++i) {
    ibody.scrollBy(0, 450)
    await new Promise((resolve) => setTimeout(resolve, 20))
    ibody.scrollBy(0, 1000)
    await new Promise((resolve) => setTimeout(resolve, 20))

    for (let i = 0; i < 8; ++i) {
      ibody.scrollBy(0, -60)
      await new Promise((resolve) => setTimeout(resolve, 45))
    }
  }
}

const loadLinkedInSkills = async () => {
  const iframe = document.createElement('iframe')

  iframe.src = `${window.location.href}details/skills/`
  iframe.style.width = '100%'
  iframe.style.height = '1600px'
  iframe.style.display = 'none'

  document.body.appendChild(iframe)

  await new Promise((resolve) => {
    iframe.contentWindow.addEventListener('DOMContentLoaded', async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      iframe.contentDocument.querySelector?.<HTMLButtonElement>('.scaffold-finite-scroll__load-button')?.click()

      await scrollPage(iframe.contentDocument.body)

      iframe.contentDocument.querySelector?.<HTMLButtonElement>('.scaffold-finite-scroll__load-button')?.click()

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const content = iframe.contentWindow.document.body.innerText
      resolve(content)
    })
  })

  setTimeout(() => {
    document.body.removeChild(iframe)
  }, 500)
}

export const lookForSkills = (msg, sender: chrome.runtime.MessageSender, sendResponse: (response) => void) => {
  let html = document.body.innerText

  if (/linkedin.com/i.test(window.location.href)) {
    scrollPage(window)

    const skillsShowMore = document.querySelector?.<HTMLButtonElement>('.pv-skills-section__additional-skills')
    if (!msg.async) {
      // expand skills
      skillsShowMore?.click()

      // expand experience
      const sks = Array.from(document.querySelectorAll<any>('.pv-profile-section__see-more-inline'))
      for (const sk of sks) {
        sk?.click()
      }
    }

    html = document.getElementById('main').innerText

    if (msg.async && !skillsShowMore) {
      loadLinkedInSkills().then((s) => {
        sendResponse({ html: `${html} ${s}`, complete: true })
      })
    } else {
      sendResponse({ html, complete: true })
    }
  } else if (/greenhouse/i.test(window.location.href)) {
    html = document.querySelector<HTMLIFrameElement>('.box-view-viewer').contentDocument.body.innerText

    sendResponse({
      html,
      complete: true,
    })
  } else {
    sendResponse({
      html,
      complete: true,
    })
  }

  return true
}

chrome.runtime.onMessage.addListener(lookForSkills)
