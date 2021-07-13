/* eslint-disable no-debugger */
import React, { Fragment, useContext, useEffect, useState } from 'react'
import { PluginManagerContext } from '../contexts/pluginmanagercontext'
import ModuleHeading from './moduleHeading'
import PluginCard from './pluginCard'
import { ModalDialog } from '@remix-ui/modal-dialog'
import { FormStateProps, PluginManagerProfile, RemixAppManager } from '../../types'
import { IframePlugin, WebsocketPlugin } from '@remixproject/engine-web'
import { Profile } from '@remixproject/plugin-utils'
import * as lo from 'lodash'

const initialState: FormStateProps = {
  name: 'test',
  displayName: 'test',
  url: '',
  type: 'iframe',
  hash: '',
  methods: 'test',
  location: 'sidePanel'
}

interface ShowInactivesProps {
  inactives: Partial<PluginManagerProfile>[]
  appManager?: RemixAppManager
  headinglabel: string
}
function ShowInactives ({ inactives, appManager, headinglabel }: ShowInactivesProps) {
  const [plugins] = useState<Profile<any>[]>(appManager.getAll())
  const [litUpProfiles] = useState<Profile<any>[]>(appManager.getActiveProfiles())
  const pluginNames = litUpProfiles.map(p => p.name)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let temp: Profile<any>[]
  pluginNames.forEach(x => {
    temp = plugins.filter(plugin => plugin.name === x)
  })
  return (
    <Fragment>
      <ModuleHeading headingLabel={headinglabel} />
      {inactives.map((profile) => (
        <PluginCard key={profile.name} profile={profile} />
      ))}
    </Fragment>
  )
}

function ShowActives ({ inactives, appManager, headinglabel }: ShowInactivesProps) {
  const [plugins] = useState<any[]>([])
  if (inactives.length === 0) {
    plugins.map(plugin => inactives.push(plugin))
  }
  return (
    <Fragment>
      <ModuleHeading headingLabel={headinglabel} />
      {inactives.map((profile) => (
        <PluginCard key={profile.name} profile={profile} />
      ))}
    </Fragment>
  )
}

function RootView () {
  const { appManager, actives, engine, inactives, localPlugin, filter } = useContext(PluginManagerContext)
  const [visible, setVisible] = useState<boolean>(true)
  const [plugin, setPlugin] = useState(initialState)
  const [allPlugins] = useState(appManager.getAll())
  const [activePlugins, setActivePlugins] = useState([])
  const [inactivePlugins, setInactivePlugins] = useState([])

  console.log(`allPlugins state has ${allPlugins.length} plugins ready to be filtered`)

  function pluginChangeHandler<P extends keyof FormStateProps> (formProps: P, value: FormStateProps[P]) {
    setPlugin({ ...plugin, [formProps]: value })
  }
  const openModal = () => {
    setVisible(false)
  }

  const closeModal = () => setVisible(true)

  const activatePlugin = async (name: string) => {
    await appManager.activatePlugin(name)
  }

  console.log('active plugins', activePlugins)
  return (
    <Fragment>
      <form id="local-plugin-form">
        <ModalDialog
          handleHide={closeModal}
          hide={visible}
          title="Local Plugin"
          okLabel="OK"
          okFn={async () => {
            const plugins = appManager.getActiveProfiles()
            console.log('There are the active plugins from appManager :', plugins)
            const profile: any = await localPlugin.open(appManager.getAll())
            if (appManager.getIds().includes(profile.name)) {
              throw new Error('This name has already been used')
            }
            const lPlugin = profile.type === 'iframe' ? new IframePlugin(profile) : new WebsocketPlugin(profile)
            console.log('handle submit local plugin', lPlugin)
            console.log('Local PLugin type from legacy as props', localPlugin)
            engine.register(lPlugin)
            console.log('engine has registered lPlugin')
            await appManager.activatePlugin(lPlugin.name)
            console.log('appManager has activated lPlugin')
          } }
          cancelLabel="Cancel"
          cancelFn={closeModal}
        >

          <div className="form-group">
            <label htmlFor="plugin-name">Plugin Name <small>(required)</small></label>
            <input className="form-control" onChange={e => pluginChangeHandler('name', e.target.value)} value={plugin.name} id="plugin-name" data-id="localPluginName" placeholder="Should be camelCase" />
          </div>
          <div className="form-group">
            <label htmlFor="plugin-displayname">Display Name</label>
            <input className="form-control" onChange={e => pluginChangeHandler('displayName', e.target.value)} value={plugin.displayName} id="plugin-displayname" data-id="localPluginDisplayName" placeholder="Name in the header" />
          </div>
          <div className="form-group">
            <label htmlFor="plugin-methods">Api (comma separated list of methods name)</label>
            <input className="form-control" onChange={e => pluginChangeHandler('methods', e.target.value)} value={plugin.methods} id="plugin-methods" data-id="localPluginMethods" placeholder="Name in the header" />
          </div>

          <div className="form-group">
            <label htmlFor="plugin-url">Url <small>(required)</small></label>
            <input className="form-control" onChange={e => pluginChangeHandler('url', e.target.value)} value={plugin.url} id="plugin-url" data-id="localPluginUrl" placeholder="ex: https://localhost:8000" />
          </div>
          <h6>Type of connection <small>(required)</small></h6>
          <div className="form-check form-group">
            <div className="radio">
              <input
                className="form-check-input"
                type="radio"
                name="type"
                value="iframe"
                id="iframe"
                data-id='localPluginRadioButtoniframe'
                checked={plugin.type === 'iframe'}
                onChange={(e) => pluginChangeHandler('type', e.target.value)} />
              <label className="form-check-label" htmlFor="iframe">Iframe</label>
            </div>
            <div className="radio">
              <input
                className="form-check-input"
                type="radio"
                name="type"
                value="ws"
                id="ws"
                data-id='localPluginRadioButtonws'
                checked={plugin.type === 'ws'}
                onChange={(e) => pluginChangeHandler('type', e.target.value)} />
              <label className="form-check-label" htmlFor="ws">Websocket</label>
            </div>
          </div>
          <h6>Location in remix <small>(required)</small></h6>
          <div className="form-check form-group">
            <div className="radio">
              <input
                className="form-check-input"
                type="radio"
                name="location"
                value="sidePanel"
                id="sidePanel"
                data-id='localPluginRadioButtonsidePanel'
                checked={plugin.location === 'sidePanel'}
                onChange={(e) => pluginChangeHandler('location', e.target.value)} />
              <label className="form-check-label" htmlFor="sidePanel">Side Panel</label>
            </div>
            <div className="radio">
              <input
                className="form-check-input"
                type="radio"
                name="location"
                value="mainPanel"
                id="mainPanel"
                data-id='localPluginRadioButtonmainPanel'
                checked={plugin.location === 'mainPanel'}
                onChange={(e) => pluginChangeHandler('location', e.target.value)} />
              <label className="form-check-label" htmlFor="mainPanel">Main Panel</label>
            </div>
            <div className="radio">
              <input
                className="form-check-input"
                type="radio"
                name="location"
                value="none"
                id="none"
                data-id='localPluginRadioButtonnone'
                checked={plugin.location === 'none'}
                onChange={(e) => pluginChangeHandler('location', e.target.value)} />
              <label className="form-check-label" htmlFor="none">None</label>
            </div>
          </div>

        </ModalDialog>
      </form><div id="pluginManager" data-id="pluginManagerComponentPluginManager">
        <header className="form-group remixui_pluginSearch plugins-header py-3 px-4 border-bottom" data-id="pluginManagerComponentPluginManagerHeader">
          <input type="text" className="form-control" placeholder="Search" data-id="pluginManagerComponentSearchInput" />
          <button onClick={openModal} className="remixui_pluginSearchButton btn bg-transparent text-dark border-0 mt-2 text-underline" data-id="pluginManagerComponentPluginSearchButton">
            Connect to a Local Plugin
          </button>
        </header>
        <section data-id="pluginManagerComponentPluginManagerSection">
          {actives !== undefined
            ? (<ShowActives appManager={appManager} headinglabel="Active Modules" inactives={inactivePlugins} />)
            : (<ShowActives headinglabel="Active Modules" inactives={activePlugins}/>)
          }
          {inactives !== undefined ? (<ShowInactives appManager={appManager} inactives={inactives} headinglabel="Inactive Modules" />) : <ShowInactives inactives={inactives} headinglabel="Inactive Modules" />}
        </section>
      </div>
    </Fragment>
  )
}

export default RootView