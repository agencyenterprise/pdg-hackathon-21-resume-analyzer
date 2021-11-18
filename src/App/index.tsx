import React, { useEffect } from 'react'
import { getActiveTabs } from '../services/chrome/get-active-tabs'
import { colorSets } from '../services/color-sets'
import './index.css'

const skillTypes = ['frontend', 'backend', 'pm', 'design', 'ios', 'android', 'soft', 'bonus']

const getColor = (skill: string) => {
  return colorSets.find((c) => c.skills.includes(skill?.toLowerCase()))?.color || '#000000'
}

const parseHtml = async ({ currentTab, setSkills, setYears, message }) => {
  await new Promise((resolve) => {
    chrome.tabs.sendMessage(
      currentTab.id,
      message,
      ({ html, timeParts, complete }: { html: string; timeParts: string; complete: boolean }) => {
        const haystack = html.toLowerCase()
        const frontendSkills = new Set(haystack.match(/typescript|javascript|react|angular|shopify/gi))
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
        const iosSkills = new Set(haystack.match(/ios|swift/gi))
        const androidSkills = new Set(haystack.match(/android|kotlin/gi))
        const softSkills = new Set(
          haystack.match(
            /emotional intelligence|communication|public speaking|self.awareness|social.awareness|growth mindset/gi,
          ),
        )
        const bonusSkills = new Set(
          haystack.match(
            /docker|kubernetes|Agile|Ionic|Cordova|Golang|React Native|redux|mobx|zapier|Solidity|styled-component|AWS|Azure|github|gitlab|bitbucket|pivotaltracker|jira|trello|slack|microsoft teams/gi,
          ),
        )

        setSkills((sk) => ({ ...sk, frontend: Array.from(frontendSkills).sort() }))
        setSkills((sk) => ({ ...sk, backend: Array.from(backendSkills).sort() }))
        setSkills((sk) => ({ ...sk, pm: Array.from(pmSkills).sort() }))
        setSkills((sk) => ({ ...sk, design: Array.from(designSkills).sort() }))
        setSkills((sk) => ({ ...sk, ios: Array.from(iosSkills).sort() }))
        setSkills((sk) => ({ ...sk, android: Array.from(androidSkills).sort() }))
        setSkills((sk) => ({ ...sk, soft: Array.from(softSkills).sort() }))
        setSkills((sk) => ({ ...sk, bonus: Array.from(bonusSkills).sort() }))

        setYears(timeParts)

        if (complete) {
          resolve(true)
        }
      },
    )
  })
}

export const App = () => {
  const [loading, setLoading] = React.useState(false)
  const [years, setYears] = React.useState('0')
  const [skill, setSkills] = React.useState({
    frontend: [],
    backend: [],
    pm: [],
    design: [],
    ios: [],
    android: [],
    soft: [],
    bonus: [],
  })

  useEffect(() => {
    const run = async () => {
      const [currentTab] = await getActiveTabs()

      if (!currentTab?.id) {
        return
      }

      setLoading(true)
      await parseHtml({ currentTab, setSkills, setYears, message: { async: false } })
      await parseHtml({ currentTab, setSkills, setYears, message: { async: true } })
      setLoading(false)
    }
    run()
  }, [])

  return (
    <div className="App">
      <div className="pad">{years}</div>
      <div className="skills">
        {skillTypes.map((type) => (
          <div key={type} className={`skill-block ${type}`}>
            <h3>{type}</h3>
            <div className="skill-list">
              {skill[type]?.map((skill) => (
                <div key={skill} style={{ color: getColor(skill) }}>
                  {skill}
                </div>
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
