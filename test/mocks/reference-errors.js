export default {
  unresolvedParameterReference: {
    input: {
      resources: [
        {
          name: 'a-function',
          type: 'cloud-function',
          config: {memory: '$.parameters.memory'},
        },
      ],
      parameters: [
        {
          name: 'memory',
          type: 'env-var',
          input: 'MEM',
        },
      ],
    },
    expected: {
      resources: [
        {
          name: 'a-function',
          type: 'cloud-function',
          config: {memory: '$.parameters.memory'},
        },
      ],
      parameters: [
        {
          name: 'memory',
          type: 'env-var',
          input: 'MEM',
        },
      ],
    },
  },

  unresolvedValueReference: {
    input: {
      resources: [
        {
          name: 'a-function',
          type: 'cloud-function',
          config: {memory: '$.values.memory'},
        },
      ],
    },
    expected: {
      resources: [
        {
          name: 'a-function',
          type: 'cloud-function',
          config: {memory: '$.values.memory'},
        },
      ],
    },
  },

  invalidReferenceTypeMetadata: {
    input: {
      resources: [
        {
          name: 'a-function',
          type: 'cloud-function',
          config: {memory: '$.metadata.memory'},
        },
      ],
    },
    expected: {
      resources: [
        {
          name: 'a-function',
          type: 'cloud-function',
          config: {memory: '$.metadata.memory'},
        },
      ],
    },
  },

  invalidReferenceType: {
    input: {
      resources: [
        {
          name: 'a-function',
          type: 'cloud-function',
          config: {memory: '$.invalid.memory'},
        },
      ],
    },
    expected: {
      resources: [
        {
          name: 'a-function',
          type: 'cloud-function',
          config: {memory: '$.invalid.memory'},
        },
      ],
    },
  },

  unresolvedParameterReferenceAndRegularReference: {
    input: {
      resources: [
        {
          name: 'a-function',
          type: 'cloud-function',
          config: {
            memory: '$.parameters.memory',
            disk: '20G',
          },
        },
        {
          name: 'another-function',
          type: 'cloud-function',
          config: {
            disk: '$.resources.a-function.config.disk',
          },
        },
      ],
      parameters: [
        {
          name: 'memory',
          type: 'env-var',
          input: 'MEM',
        },
      ],
    },
    expected: {
      resources: [
        {
          name: 'a-function',
          type: 'cloud-function',
          config: {
            memory: '$.parameters.memory',
            disk: '20G',
          },
        },
        {
          name: 'another-function',
          type: 'cloud-function',
          config: {
            disk: '$.resources.a-function.config.disk',
          },
        },
      ],
      parameters: [
        {
          name: 'memory',
          type: 'env-var',
          input: 'MEM',
        },
      ],
    },
    unresolved: [
      {
        path: 'resources.another-function.config.disk',
        ref: '$.resources.a-function.config.disk',
      },
    ],
  },
}
