package com.ltuga.zeitkonto;
public class GeoEngineTest {
 static void eq(int expected,int actual){if(expected!=actual)throw new AssertionError(expected+" != "+actual);}
 public static void main(String[] args){
  long t=10000000;GeoEngine e=new GeoEngine();
  eq(0,e.sample(true,false,10,20,200,t,300000,900000));
  eq(0,e.sample(true,false,10,20,200,t+299999,300000,900000));
  eq(1,e.sample(true,false,10,20,200,t+300000,300000,900000));
  // Duplicate arrival cannot open another shift.
  eq(0,e.sample(true,true,10,20,200,t+301000,300000,900000));
  // A brief departure during a break is cancelled on return.
  eq(0,e.sample(true,true,400,20,200,t+400000,300000,900000));
  eq(0,e.sample(true,true,10,20,200,t+800000,300000,900000));
  eq(0,e.sample(true,true,400,20,200,t+900000,300000,900000));
  eq(-1,e.sample(true,true,400,20,200,t+1800000,300000,900000));
  eq(0,e.sample(true,false,400,20,200,t+1800001,300000,900000));
  // Imprecise/borderline GPS and permissions refused never create records.
  eq(0,e.sample(true,false,10,200,200,t+2000000,300000,900000));
  eq(0,e.sample(true,false,195,20,200,t+2000000,300000,900000));
  eq(0,e.sample(false,false,10,20,200,t+2000000,300000,900000));
  // Cooldown, rollback and reboot discard unconfirmed dwell.
  e.lastAction=t+2000000;
  eq(0,e.sample(true,false,10,20,200,t+2010000,300000,900000));
  eq(0,e.sample(true,false,10,20,200,t+1900000,300000,900000));
  e=new GeoEngine();
  eq(0,e.sample(true,false,10,20,200,t+3000000,300000,900000));
  // Persisted candidate survives process recreation, independent of any planned shift.
  GeoEngine restored=new GeoEngine();restored.candidate=e.candidate;restored.since=e.since;
  eq(1,restored.sample(true,false,10,20,200,t+3300000,300000,900000));
  System.out.println("GeoEngine: 16 assertions passed (simulated lifecycle, not Android instrumentation).");
 }
}
