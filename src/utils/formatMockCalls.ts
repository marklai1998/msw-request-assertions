export const ordinalOf = (i: number) => {
  const j = i % 10;
  const k = i % 100;

  if (j === 1 && k !== 11) {
    return `${i}st`;
  }

  if (j === 2 && k !== 12) {
    return `${i}nd`;
  }

  if (j === 3 && k !== 13) {
    return `${i}rd`;
  }

  return `${i}th`;
};

export const formatMockCalls = (name: string, calls: unknown[][], msg = '') => {
  if (calls.length) {
    msg += `\n\nReceived: \n\n${calls
      .map((callArg, i) => {
        let methodCall = `  ${ordinalOf(i + 1)} ${name} call:\n\n`;

        methodCall += JSON.stringify(callArg[0])
          .split('\n')
          .map((line) => `    ${line}`)
          .join('\n');

        methodCall += '\n';
        return methodCall;
      })
      .join('\n')}`;
  }
  msg += `\n\nNumber of calls: ${calls.length}\n`;
  return msg;
};
