import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism'

const ContentPanel = ({ data, activeView, selectedItem }) => {
  if (!selectedItem) {
    return (
      <div className="flex-1 p-10 overflow-y-auto bg-white">
        <div className="surface rounded-none p-12 text-center reveal" style={{ animationDelay: '120ms' }}>
          <div className="pill text-black mb-4 bg-yellow-400 border-black">Awaiting Selection</div>
          <div className="text-2xl font-black text-black uppercase">Pick a route to start.</div>
        </div>
      </div>
    )
  }

  if (selectedItem.type === 'article') {
    const article = data?.articles?.find(a => a.id === selectedItem.id)
    
    if (!article) {
      return (
        <div className="flex-1 p-10 overflow-y-auto bg-white">
          <div className="surface rounded-none p-12 text-center reveal" style={{ animationDelay: '120ms' }}>
            <div className="pill text-black mb-4 bg-yellow-400 border-black">Article Not Found</div>
            <div className="text-2xl font-black text-black uppercase">The selected article could not be found.</div>
            {data?.articles?.length > 0 && (
              <div className="mt-4 text-sm text-black/70">
                Available articles: {data.articles.length}
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="flex-1 p-10 overflow-y-auto bg-white">
        <div className="surface rounded-none p-10 reveal" style={{ animationDelay: '150ms' }}>
          <h1 className="text-4xl font-black text-black mb-6 font-['Syne'] uppercase">{article.title}</h1>
          <div className="prose prose-base max-w-none text-black">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-black mb-5 mt-8 font-['Syne'] uppercase" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-black mb-4 mt-6 font-['Syne'] uppercase" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-bold text-black mb-3 mt-4 font-['Syne'] uppercase" {...props} />,
              p: ({node, ...props}) => <p className="text-base text-black/90 mb-4 leading-relaxed font-medium" {...props} />,
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <div className="my-5 border-2 border-black">
                    <SyntaxHighlighter
                      style={oneLight}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        padding: '18px',
                        fontSize: '15px',
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '0'
                      }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className="bg-yellow-100 px-2 py-1 font-mono text-sm border border-black text-black font-bold" {...props}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {article.markdown_content}
          </ReactMarkdown>
          </div>
        </div>
      </div>
    )
  }

  if (selectedItem.type === 'endpoint') {
    const path = selectedItem.path
    const method = selectedItem.method
    const operation = data.openapi.paths[path]?.[method]
    if (!operation) return null

    const parameters = operation.parameters || []
    const requestBody = operation.requestBody
    const responses = operation.responses || {}
    const servers = data.openapi.servers || []
    const serverUrl = data.api_server || servers[0]?.url || ''

    return (
      <div className="flex-1 p-10 overflow-y-auto space-y-8 bg-white">
        <div className="surface rounded-none p-8 reveal" style={{ animationDelay: '160ms' }}>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="chip bg-yellow-400 text-black border-black">
              {method}
            </span>
            <span className="text-3xl font-black tracking-tight text-black font-['Syne']">{path}</span>
          </div>

          {operation.summary && (
            <p className="text-xl font-bold text-black mb-4 border-l-4 border-yellow-400 pl-4">{operation.summary}</p>
          )}

        {operation.description && (
          <div className="text-sm text-black/80 leading-relaxed space-y-3 font-medium">
            <ReactMarkdown>{operation.description}</ReactMarkdown>
          </div>
        )}
        </div>

        {parameters.length > 0 && (
          <section className="surface rounded-none p-8 reveal" style={{ animationDelay: '200ms' }}>
            <div className="text-xs uppercase tracking-[0.3em] text-black/60 mb-6 font-bold">Parameters</div>
            <div className="divide-y-2 divide-black">
              {parameters.map((param, idx) => (
                <div key={idx} className="py-4 grid grid-cols-12 gap-4 text-sm text-black">
                  <div className="col-span-3">
                    <div className="text-xs uppercase tracking-[0.3em] text-black/50 mb-1 font-bold">{param.in}</div>
                    <div className="font-bold text-black text-lg">{param.name}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="chip bg-white text-black">
                      {param.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                  <div className="col-span-7 font-medium">{param.description || '-'}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {requestBody && (
          <section className="surface rounded-none p-8 reveal" style={{ animationDelay: '220ms' }}>
            <div className="text-xs uppercase tracking-[0.3em] text-black/60 mb-6 font-bold">Request Body</div>
            <div className="space-y-4">
              {requestBody.content && Object.entries(requestBody.content).map(([contentType, content]) => (
                <div key={contentType}>
                  <div className="text-xs uppercase tracking-[0.3em] text-black/50 mb-2 font-bold">Content-Type · {contentType}</div>
                  {content.schema && (
                    <div className="rounded-none border-2 border-black bg-white">
                      <SyntaxHighlighter language="json" style={oneLight} customStyle={{ margin: 0, padding: '18px', fontSize: '15px', backgroundColor: '#fff' }}>
                        {JSON.stringify(buildExampleFromSchema(content.schema), null, 2)}
                      </SyntaxHighlighter>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {Object.keys(responses).length > 0 && (
          <section className="surface rounded-none p-8 reveal" style={{ animationDelay: '240ms' }}>
            <div className="text-xs uppercase tracking-[0.3em] text-black/60 mb-6 font-bold">Responses</div>
            {Object.entries(responses).map(([statusCode, response]) => (
              <div key={statusCode} className="mb-6 last:mb-0">
                <div className="flex items-center mb-3 gap-3 text-black">
                  <span className={`chip ${statusCode.startsWith('2') ? 'bg-green-100' : 'bg-yellow-100'} border-black`}>
                    {statusCode}
                  </span>
                  <span className="text-sm font-bold">{response.description}</span>
                </div>
                {response.content && Object.entries(response.content).map(([contentType, content]) => (
                  <div key={contentType}>
                    {content.schema && (
                      <div className="rounded-none border-2 border-black bg-white">
                        <SyntaxHighlighter language="json" style={oneLight} customStyle={{ margin: 0, padding: '18px', fontSize: '15px', backgroundColor: '#fff' }}>
                          {JSON.stringify(buildExampleFromSchema(content.schema), null, 2)}
                        </SyntaxHighlighter>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </section>
        )}
      </div>
    )
  }

  return null
}

function buildExampleFromSchema(schema) {
  if (!schema) return {}
  
  if (schema.example) return schema.example
  
  if (schema.type === 'object' && schema.properties) {
    const example = {}
    Object.entries(schema.properties).forEach(([key, prop]) => {
      example[key] = buildExampleFromSchema(prop)
    })
    return example
  }
  
  if (schema.type === 'array' && schema.items) {
    return [buildExampleFromSchema(schema.items)]
  }
  
  // Default values based on type
  switch (schema.type) {
    case 'string':
      return schema.enum ? schema.enum[0] : 'string'
    case 'number':
    case 'integer':
      return 0
    case 'boolean':
      return false
    case 'array':
      return []
    case 'object':
      return {}
    default:
      return null
  }
}

export default ContentPanel
