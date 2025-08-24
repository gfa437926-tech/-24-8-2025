
// supabase.js - الإصلاح
import {createClient} from '@supabase/supabase-js';

const supabaseUrl = 'https://yyjjzaoqoxjzgczmleng.supabase.co';
const supabaseKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5amp6YW9xb3hqemdjem1sZW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5OTQ5MDAsImV4cCI6MjA3MTU3MDkwMH0.litRFbIqhTO0MkfilJqhkxV42MujKHn_B8MuewccFpc';
export const supabase = createClient (supabaseUrl, supabaseKey);

// دالة للتحقق من حالة المستخدم
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

// دالة لإرسال البيانات الساعية
export const insertHourlyData = async (data) => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('يجب تسجيل الدخول أولاً')
    }

    const { data: result, error } = await supabase
      .from('hourly_observations')
      .insert([{
        station_id: data.stationId,
        observer_id: user.id, // استخدام ID المستخدم المسجل
        observation_date: data.observationDate,
        observation_time: data.observationTime,
        dry_temperature: parseFloat(data.dryTemp) || null,
        wet_temperature: parseFloat(data.wetTemp) || null,
        station_pressure: parseFloat(data.stationPressure) || null,
        pressure_msl: parseFloat(data.stationPressureMSL) || null,
        wind_direction_surface: data.windDirSurface || null,
        wind_speed_surface: data.windSpeedSurface || null,
        wind_direction_mean: data.windDirMean || null,
        wind_speed_mean: data.windSpeedMean || null,
        visibility: data.visibility || null,
        current_weather: data.currentWeather || null,
        past_weather: data.pastWeather || null,
        cloud_cover_total: data.cloudCoverTotal || null,
        cloud_amount1: data.cloudAmount1 || null,
        cloud_type1: data.cloudType1 || null,
        cloud_height1: data.cloudHeight1 || null,
        cloud_amount2: data.cloudAmount2 || null,
        cloud_type2: data.cloudType2 || null,
        cloud_height2: data.cloudHeight2 || null,
        cloud_amount3: data.cloudAmount3 || null,
        cloud_type3: data.cloudType3 || null,
        cloud_height3: data.cloudHeight3 || null,
        cloud_amount4: data.cloudAmount4 || null,
        cloud_sum12: data.cloudSum12 || null,
        cloud_sum123: data.cloudSum123 || null,
        vapor_pressure: parseFloat(data.vaporPressure) || null,
        dew_point: parseFloat(data.dewPoint) || null,
        relative_humidity: parseFloat(data.relativeHumidity) || null,
        vapor_pressure_diff: parseFloat(data.vaporPressureDiff) || null,
        station_password: data.stationPassword,
        responsibility_accepted: Boolean(data.responsibilityAccepted)
      }])
      .select()

    if (error) throw error
    return { success: true, data: result }
  } catch (error) {
    console.error('Error inserting hourly data:', error)
    return { success: false, error: error.message }
  }
}

// دالة لإرسال البيانات اليومية
export const insertDailyData = async (data) => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('يجب تسجيل الدخول أولاً')
    }

    const { data: result, error } = await supabase
      .from('daily_observations')
      .insert([{
        station_id: data.stationId,
        observer_id: user.id, // استخدام ID المستخدم المسجل
        observation_date: data.observationDate,
        observation_period: data.observationPeriod,
        min_temperature: parseFloat(data.minTemp) || null,
        max_temperature: parseFloat(data.maxTemp) || null,
        precipitation: parseFloat(data.precipitation) || null,
        snow_thickness: data.snowThickness || null,
        thunderstorm: Boolean(data.thunderstorm),
        hail: Boolean(data.hail),
        snow: Boolean(data.snow),
        rain: Boolean(data.rain),
        frost: Boolean(data.frost),
        fog: Boolean(data.fog),
        drizzle: Boolean(data.drizzle),
        dust_storm: Boolean(data.dustStorm),
        dust: Boolean(data.dust),
        haze: Boolean(data.haze),
        stormy_wind: Boolean(data.stormyWind),
        evaporation_record: parseFloat(data.evaporationRecord) || null,
        evaporation_leach: parseFloat(data.evaporationLeach) || null,
        actual_sunshine: parseFloat(data.actualSunshine) || null,
        total_sunshine: parseFloat(data.totalSunshine) || null,
        sunshine_percentage: data.sunshinePercentage || null,
        gust_speed: data.gustSpeed || null,
        gust_direction: data.gustDirection || null,
        gust_time: parseFloat(data.gustTime) || null,
        max_humidity: data.maxHumidity || null,
        max_humidity_time: parseFloat(data.maxHumidityTime) || null,
        min_humidity: data.minHumidity || null,
        min_humidity_time: parseFloat(data.minHumidityTime) || null,
        dew_amount: parseFloat(data.dewAmount) || null,
        station_password: data.stationPassword,
        responsibility_accepted: Boolean(data.responsibilityAccepted)
      }])
      .select()

    if (error) throw error
    return { success: true, data: result }
  } catch (error) {
    console.error('Error inserting daily data:', error)
    return { success: false, error: error.message }
  }
}

// دالة للتحقق من كلمة مرور المحطة
export const validateStationPassword = async (stationCode, password) => {
  try {
    // هذه دالة افتراضية - تحتاج إلى تعديل حسب نظام المصادقة الخاص بك
    // يمكنك التحقق من كلمة المرور في جدول المحطات أو نظام خارجي
    
    const { data, error } = await supabase
      .from('stations')
      .select('auth_password, code')
      .eq('code', stationCode)
      .single()

    if (error) {
      console.warn('Station not found or password validation not implemented')
      // للاختبار: أي كلمة مرور غير فارغة تعتبر صحيحة
      return password !== '' && password !== null
    }

    // في الإنتاج الحقيقي، استخدم مقارنة آمنة لكلمات المرور
    return data.auth_password === password
    
  } catch (error) {
    console.error('Error validating station password:', error)
    return false
  }
}

// دالة لجلب بيانات المحطات
export const getStations = async () => {
  try {
    const { data, error } = await supabase
      .from('stations')
      .select('*')
      .order('name')

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching stations:', error)
    return { success: false, error: error.message }
  }
}

// دالة لجلب أنواع السحب
export const getCloudTypes = async () => {
  try {
    const { data, error } = await supabase
      .from('cloud_types')
      .select('*')
      .order('code')

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching cloud types:', error)
    return { success: false, error: error.message }
  }
}

// دالة لجلب رموز الطقس
export const getWeatherCodes = async () => {
  try {
    const { data, error } = await supabase
      .from('weather_codes')
      .select('*')
      .order('code')

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching weather codes:', error)
    return { success: false, error: error.message }
  }
}

// دالة لتسجيل الأخطاء
export const logError = async (errorData) => {
  try {
    const { error } = await supabase
      .from('error_logs')
      .insert([{
        error_message: errorData.message,
        error_stack: errorData.stack,
        component: errorData.component,
        user_id: (await getCurrentUser())?.id,
        station_id: errorData.stationId,
        additional_data: errorData.data
      }])

    if (error) console.error('Failed to log error:', error)
  } catch (logError) {
    console.error('Failed to log error:', logError)
  }
}

// دالة للتحقق من اتصال Supabase
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('stations')
      .select('count')
      .limit(1)

    return { connected: !error, error: error?.message }
  } catch (error) {
    return { connected: false, error: error.message }
  }
}