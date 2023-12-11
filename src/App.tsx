import { Key, useState } from 'react'
import { getHandles } from './getHandles'

const Error = ({ error }: any) => (
  <div>
    <h3>Error</h3>
    {error.name}: {error.message}
  </div>
)

const Handles = ({ list }: any) => (
  <table>
    <thead>
      <tr>
        <th>URL</th>
        <th>State</th>
        <th>Num Changes</th>
        <th>Heads</th>
      </tr>
    </thead>
    {list.map(({ url, state, count, heads }: any, key: number) => (
      <tr key={key}>
        <td>{url}</td>
        <td>{state}</td>
        <td>{count ?? '?'}</td>
        <td>{heads}</td>
      </tr>
    ))}
  </table>
)

function App() {
  const [handles, setHandles] = useState([])
  const [error, setError] = useState(undefined)
  return (
    <div>
      <button
        onClick={(e) =>
          getHandles()
            .then((res) => {
              setError(undefined)
              setHandles(res)
            })
            .catch((error) => {
              setError(error)
              console.error(error)
            })
        }
        children='refresh'
      />
      {error ? <Error error={error} /> : <Handles list={handles} />}
    </div>
  )
}

export default App
