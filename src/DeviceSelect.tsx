import * as React from 'react'
import { useEffect, useState } from 'react'

let getWebcamStream = (deviceId?: string) =>
  navigator.mediaDevices.getUserMedia({
    video: deviceId
      ? { deviceId: { exact: deviceId } }
      : { facingMode: 'user' },
    audio: { noiseSuppression: true, echoCancellation: true },
  })

export let DeviceSelect = ({
  kind = 'videoinput',
  onChange,
}: {
  kind?: MediaDeviceKind
  onChange: (v: MediaStream) => void
}) => {
  let [deviceId, setDeviceId] = useState<string>()
  let [devices, setDevices] = useState<MediaDeviceInfo[]>([])

  useEffect(() => {
    let loadDevices = async () => {
      let devices = await navigator.mediaDevices.enumerateDevices()

      setDevices(devices.filter((d) => d.kind === kind))
    }

    loadDevices()
  }, [])

  useEffect(() => {
    getWebcamStream(deviceId).then(onChange)
  }, [deviceId])

  return (
    <label>
      {kind}:
      <select onChange={(e) => setDeviceId(e.target.value)}>
        {devices.map((d, i) => (
          <option key={d.deviceId} value={d.deviceId}>
            {d.label}
          </option>
        ))}
      </select>
    </label>
  )
}
