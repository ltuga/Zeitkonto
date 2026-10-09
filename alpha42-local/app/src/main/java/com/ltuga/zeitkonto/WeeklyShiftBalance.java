package com.ltuga.zeitkonto;
import java.time.*;
import java.util.*;
/** Motor isolado de cálculo em minutos. Ainda não ligado à interface nem ao SQLite. */
public final class WeeklyShiftBalance {
 private WeeklyShiftBalance(){}
 public enum Kind { NORMAL, EXTRA, VACATION, SICK, REST, MISSING_CONFIRMED, PENDING }
 public static final class Day {
  public final LocalDateTime start;
  public final Kind kind;
  public final long minutes;
  public Day(LocalDateTime start,Kind kind,long minutes){
   if(start==null||kind==null||minutes<0||minutes>1440)throw new IllegalArgumentException();
   this.start=start;this.kind=kind;this.minutes=minutes;
  }
 }
 public static final class Result {
  public long worked, justified, explicitlyExtra, automaticExtra, negative, pending;
  public long totalExtra(){return explicitlyExtra+automaticExtra;}
  public long bankChange(){return totalExtra()-negative;}
 }
 public static Map<LocalDateTime,Result> calculate(Collection<Day> days,String weekMode,long target,long dailyDue){
  if(days==null||target<=0||dailyDue<0)throw new IllegalArgumentException();
  Map<LocalDateTime,List<Day>> groups=new TreeMap<>();
  for(Day d:days)groups.computeIfAbsent(weekStart(d.start,weekMode),k->new ArrayList<>()).add(d);
  Map<LocalDateTime,Result> results=new TreeMap<>();
  for(Map.Entry<LocalDateTime,List<Day>> group:groups.entrySet()){
   Result r=new Result();long normal=0;
   for(Day d:group.getValue())switch(d.kind){
    case NORMAL:normal+=d.minutes;r.worked+=d.minutes;break;
    case EXTRA:r.explicitlyExtra+=d.minutes;r.worked+=d.minutes;break;
    case VACATION:case SICK:r.justified+=d.minutes;break;
    case MISSING_CONFIRMED:r.negative+=dailyDue;break;
    case PENDING:r.pending++;break;
    case REST:break;
   }
   r.automaticExtra=Math.min(normal,Math.max(0,normal+Math.min(r.justified,target)-target));
   results.put(group.getKey(),r);
  }
  return results;
 }
 private static LocalDateTime weekStart(LocalDateTime date,String mode){
  if("sunday22".equals(mode)){
   LocalDateTime sunday=date.toLocalDate().minusDays(date.getDayOfWeek().getValue()%7).atTime(22,0);
   return date.isBefore(sunday)?sunday.minusWeeks(1):sunday;
  }
  DayOfWeek first;
  if("monday".equals(mode))first=DayOfWeek.MONDAY;
  else if(mode!=null&&mode.matches("day[1-7]"))first=DayOfWeek.of(Integer.parseInt(mode.substring(3)));
  else throw new IllegalArgumentException("Invalid week mode");
  return date.toLocalDate().minusDays((date.getDayOfWeek().getValue()-first.getValue()+7)%7).atStartOfDay();
 }
}