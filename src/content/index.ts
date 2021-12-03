const scrollPage = async (ibody) => {
  ibody.scrollBy(0, 2500)
  await new Promise((resolve) => setTimeout(resolve, 50))
  ibody.scrollBy(0, -150)
  await new Promise((resolve) => setTimeout(resolve, 50))
  ibody.scrollBy(0, 3000)
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

      for (let i = 0; i < 2; ++i) {
        const loadButton = iframe.contentDocument.querySelector<HTMLButtonElement>(
          '.scaffold-finite-scroll__load-button',
        )
        if (loadButton) {
          loadButton.click()
        }

        await scrollPage(iframe.contentDocument.body)
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      const content = iframe.contentWindow.document.body.innerText
      resolve(content)
    })
  })

  setTimeout(() => {
    document.body.removeChild(iframe)
  }, 500)
}

const getPageAsBlob = () => {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('GET', window.location.href, true)
    request.responseType = 'blob'
    request.onload = function () {
      const reader = new FileReader()
      reader.readAsDataURL(request.response)
      reader.onload = function (e) {
        resolve(e.target.result)
      }
    }
    request.onerror = () => reject()
    request.send()
  })
}

export const lookForSkills = (msg, sender: chrome.runtime.MessageSender, sendResponse: (response) => void) => {
  let html = document.body.innerText

  try {
    if (/[.]pdf/i.test(window.location.href)) {
      sendResponse({ html, complete: true })
    } else if (/linkedin.com/i.test(window.location.href)) {
      scrollPage(window)

      const skillsShowMore = document.querySelector<HTMLButtonElement>('.pv-skills-section__additional-skills')
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
      const expTimesContainer = Array.from(document.querySelectorAll<HTMLHeadingElement>('h2'))
        .find((x) => x.innerText.includes('Experience'))
        .closest('section')

      const timePartsNewV = Array.from(expTimesContainer.querySelectorAll<HTMLSpanElement>('a span.t-14'))
      const timePartsOldV = Array.from(expTimesContainer.querySelectorAll('span')).filter(
        (el) => !el.closest('.pv-entity__position-group-role-item'),
      )
      const timeParts = (timePartsNewV?.length ? timePartsNewV : timePartsOldV)
        .map((el) => el.innerText)
        .filter((el) => /\d+ yrs?|\d+ mos?/.test(el))
        .map((el) => el.replace(/\n[\S\s]+/, ''))
        .map((el) => el.replace(/[\S\s]+ · /, ''))
        .join(' | ')

      if (msg.async && !skillsShowMore) {
        loadLinkedInSkills().then((s) => {
          sendResponse({ html: `${html} ${s}`, timeParts, complete: true })
        })
      } else {
        sendResponse({ html, timeParts, complete: true })
      }
    } else if (/greenhouse[.]io/i.test(window.location.href)) {
      html = document.querySelector<HTMLIFrameElement>('.box-view-viewer').contentDocument.body.innerText

      sendResponse({
        html,
        complete: true,
      })
    } else if (/angel[.]co/i.test(window.location.href)) {
      const allExpandedResumes = document.querySelectorAll<HTMLDivElement>(
        '[data-component="CandidateCard"]:not([class*="styles_minimize"])',
      )
      if (!allExpandedResumes?.length) {
        html = document.querySelector<HTMLDivElement>('[data-component="CandidateCard"]')?.innerText
      } else {
        html = allExpandedResumes[allExpandedResumes.length - 1].innerText
        allExpandedResumes[allExpandedResumes.length - 1].style.background = 'red !important'
      }

      sendResponse({
        html,
        complete: true,
      })
    } else if (/hired[.]com/i.test(window.location.href)) {
      html = document.querySelector<HTMLDivElement>('[role="dialog"]').innerText

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
  } catch (err) {
    sendResponse({ html, err, complete: true })
  }

  return true
}

chrome.runtime.onMessage.addListener(lookForSkills)
