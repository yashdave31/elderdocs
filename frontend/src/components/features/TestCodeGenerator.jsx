import React from 'react'

const TestCodeGenerator = ({ requestData }) => {
  return (
    <div className="p-4 bg-green-500 border-4 border-black">
      <h2 className="text-xl font-bold text-white">TEST COMPONENT WORKS!</h2>
      <p className="text-white">URL: {requestData?.url || 'NO URL'}</p>
      <p className="text-white">Method: {requestData?.method || 'NO METHOD'}</p>
    </div>
  )
}

export default TestCodeGenerator

