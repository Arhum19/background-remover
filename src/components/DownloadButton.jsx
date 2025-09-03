import React from 'react'

export default function DownloadButton({ onClick, disabled }) {
  return (
    <button className="btn-primary" disabled={disabled} onClick={onClick}>Download</button>
  )
}

