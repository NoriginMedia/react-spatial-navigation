const getRect = (node) => {
  const rect = node.getBoundingClientRect();

  return {
    height: Math.ceil(rect.height),
    left: Math.ceil(rect.left),
    top: Math.ceil(rect.top),
    width: Math.ceil(rect.width)
  };
};

const measureLayout = (node, callback) => {
  const relativeNode = node && node.parentNode;

  if (node && relativeNode) {
    const relativeRect = getRect(relativeNode);
    const {height, left, top, width} = getRect(node);
    const x = left - relativeRect.left;
    const y = top - relativeRect.top;

    callback(x, y, width, height, left, top);
  }
};

export default measureLayout;
