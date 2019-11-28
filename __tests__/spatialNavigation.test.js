import {getChildClosestToOrigin} from '../src/spatialNavigation';

class Child {
  constructor(top, left) {
    this.layout = {};
    this.layout.top = top;
    this.layout.left = left;
  }
}

test('The getChildClosestToOrigin is working well', () => {
  const children = [
    new Child(-11.43242342, 222),
    new Child(0, 1),
    new Child(-0.00001, 0.2),
    new Child(10, 12)
  ];

  const childClosestToOrigin = new Child(-0.00001, 0.2);

  const result = getChildClosestToOrigin(children);

  expect(result).toEqual(childClosestToOrigin);
});
