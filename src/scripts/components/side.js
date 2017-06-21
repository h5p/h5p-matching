/**
 * @enum {object}
 */
const Side = {
  LEFT: 'left',
  RIGHT: 'right'
};

Side.getOtherSide = function(side) {
  if(side === Side.LEFT){
    return Side.RIGHT;
  }
  else if(side === Side.RIGHT){
    return Side.LEFT;
  }
};

export default Side;