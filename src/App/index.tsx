import React, { useEffect } from 'react'
import { getActiveTabs } from '../services/chrome/get-active-tabs'
import './index.css'

const skillTypes = ['frontend', 'backend', 'pm', 'design', 'soft']

const parseHtml = async ({ currentTab, setSkills, message }) => {
  await new Promise((resolve) => {
    chrome.tabs.sendMessage(currentTab.id, message, ({ html, complete }: { html: string; complete: boolean }) => {
      const haystack = html.toLowerCase()
      const frontendSkills = new Set(
        haystack.match(/typescript|javascript|react|redux|angular|styled-component|shopify/gi),
      )
      const backendSkills = new Set(
        haystack.match(
          /node[.]?js|ruby on rails|python|c#|.NET Framework|PostgreSQL|Docker|SQL|Blockchain|REST|GraphQL|mySQL/gi,
        ),
      )
      const pmSkills = new Set(haystack.match(/agile|(product|project) manage(r|ment)/gi))
      const designSkills = new Set(
        haystack.match(
          /figma|photoshop|illustrator|invision|ux research|adobe creative suite|visual design|wireframing|logo design|user experience|graphic design/gi,
        ),
      )
      const softSkills = new Set(
        haystack.match(/emotional intelligence|communication|public speaking|self.awareness|social.awareness/gi),
      )

      setSkills((sk) => ({ ...sk, frontend: Array.from(frontendSkills) }))
      setSkills((sk) => ({ ...sk, backend: Array.from(backendSkills) }))
      setSkills((sk) => ({ ...sk, pm: Array.from(pmSkills) }))
      setSkills((sk) => ({ ...sk, design: Array.from(designSkills) }))
      setSkills((sk) => ({ ...sk, soft: Array.from(softSkills) }))

      if (complete) {
        resolve(true)
      }
    })
  })
}

export const App = () => {
  const [loading, setLoading] = React.useState(false)
  const [skill, setSkills] = React.useState({
    frontend: [],
    backend: [],
    pm: [],
    design: [],
    soft: [],
  })

  useEffect(() => {
    const run = async () => {
      const [currentTab] = await getActiveTabs()

      if (!currentTab?.id) {
        return
      }

      setLoading(true)
      await parseHtml({ currentTab, setSkills, message: { async: false } })
      await parseHtml({ currentTab, setSkills, message: { async: true } })
      setLoading(false)
    }
    run()
  }, [])

  return (
    <div className="App">
      <strong>{document.title}</strong>
      <div className="skills">
        {skillTypes.map((type) => (
          <div key={type} className={`skill-block ${type}`}>
            <h2>{type}</h2>
            <div className="skill-list">
              {skill[type]?.map((skill) => (
                <div key={skill}>{skill}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {loading ? <hr /> : null}
      <div>{loading ? 'Loading...' : ''}</div>
    </div>
  )
}
