import com.ltuga.zeitkonto.WeeklyShiftBalance;
import java.time.*;
import java.util.*;
public class WeeklyShiftBalanceTest {
 static int checks=0;
 static WeeklyShiftBalance.Day d(String date,int hours,WeeklyShiftBalance.Kind kind){
  return new WeeklyShiftBalance.Day(LocalDateTime.parse(date+"T22:00"),kind,hours*60);
 }
 static void eq(long got,long expected){checks++;if(got!=expected)throw new AssertionError(got+" != "+expected);}
 static WeeklyShiftBalance.Result calc(WeeklyShiftBalance.Day... days){
  return WeeklyShiftBalance.calculate(Arrays.asList(days),"sunday22",2400,480).values().iterator().next();
 }
 public static void main(String[] args){
  WeeklyShiftBalance.Result r=calc(d("2026-09-06",8,WeeklyShiftBalance.Kind.NORMAL),d("2026-09-07",8,WeeklyShiftBalance.Kind.NORMAL),d("2026-09-08",8,WeeklyShiftBalance.Kind.NORMAL),d("2026-09-09",8,WeeklyShiftBalance.Kind.NORMAL),d("2026-09-10",8,WeeklyShiftBalance.Kind.NORMAL),d("2026-09-11",8,WeeklyShiftBalance.Kind.EXTRA));
  eq(r.worked,2880);eq(r.totalExtra(),480);eq(r.automaticExtra,0);
  r=calc(d("2026-09-06",8,WeeklyShiftBalance.Kind.EXTRA),d("2026-09-07",8,WeeklyShiftBalance.Kind.NORMAL),d("2026-09-08",8,WeeklyShiftBalance.Kind.NORMAL),d("2026-09-09",8,WeeklyShiftBalance.Kind.NORMAL),d("2026-09-10",8,WeeklyShiftBalance.Kind.NORMAL),d("2026-09-11",8,WeeklyShiftBalance.Kind.NORMAL));
  eq(r.totalExtra(),480);eq(r.automaticExtra,0);
  r=calc(d("2026-09-06",8,WeeklyShiftBalance.Kind.NORMAL),d("2026-09-07",8,WeeklyShiftBalance.Kind.NORMAL),d("2026-09-08",8,WeeklyShiftBalance.Kind.NORMAL),d("2026-09-09",8,WeeklyShiftBalance.Kind.NORMAL),d("2026-09-10",8,WeeklyShiftBalance.Kind.NORMAL),d("2026-09-11",8,WeeklyShiftBalance.Kind.NORMAL));eq(r.totalExtra(),480);
  r=calc(d("2026-09-06",0,WeeklyShiftBalance.Kind.VACATION),d("2026-09-07",8,WeeklyShiftBalance.Kind.SICK),d("2026-09-08",0,WeeklyShiftBalance.Kind.PENDING),d("2026-09-09",0,WeeklyShiftBalance.Kind.REST));eq(r.negative,0);eq(r.pending,1);
  r=calc(d("2026-09-06",0,WeeklyShiftBalance.Kind.MISSING_CONFIRMED));eq(r.negative,480);eq(r.bankChange(),-480);
  System.out.println(checks+" classified shift checks passed");
 }
}