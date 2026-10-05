import test from 'node:test';
import assert from 'node:assert/strict';
import {joystickPose} from '../src/game/joystick.ts';
test('joystick center dead zone releases movement',()=>{
 assert.deepEqual(joystickPose(0,0).keys,[]);
 assert.deepEqual(joystickPose(6,7).keys,[]);
});
test('joystick supports four axes and diagonals with dominant facing last',()=>{
 assert.deepEqual(joystickPose(40,0).keys,['ArrowRight']);
 assert.deepEqual(joystickPose(-40,0).keys,['ArrowLeft']);
 assert.deepEqual(joystickPose(0,-40).keys,['ArrowUp']);
 assert.deepEqual(joystickPose(0,40).keys,['ArrowDown']);
 assert.deepEqual(joystickPose(40,-30).keys,['ArrowUp','ArrowRight']);
 assert.deepEqual(joystickPose(-30,40).keys,['ArrowLeft','ArrowDown']);
});
test('knob stays within the circular pad even when pointer leaves it',()=>{
 const pose=joystickPose(300,-400);
 assert.ok(Math.abs(Math.hypot(pose.x,pose.y)-44)<1e-9);
 assert.deepEqual(pose.keys,['ArrowRight','ArrowUp']);
});
