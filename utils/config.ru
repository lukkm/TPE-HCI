# Tool to cache API responses using Redis
# Had to finish it offline while on the bus so never got the chance to build
# proper request caching. Responses get added manually using the debugger

require "redis"
require "debugger"

class API
  def call(env)
    redis = Redis.current

    params = env["QUERY_STRING"]
    filtered_params = filter_jsonp(params)

    base_url = env["PATH_INFO"]
    normalized_url = base_url + "?" + filtered_params

    response = redis.get(normalized_url)
    unless response
      debugger;
      redis.set(normalized_url, response)
    end

    callback = extract_callback(params)

    if callback
      response = callback + "(" + response + ");"
    end

    [200, {'Content-Type' => 'text/html'}, [response]]
  end

  def filter_jsonp(params)
    params.split("&")
          .reject { |p| p.start_with?("callback") ||
                        p.start_with?("_") }
          .join("&")
  end

  def extract_callback(params)
    callback = params.split("&")
          .select { |p| p.start_with?("callback") }
          .first

    return nil unless callback
    callback.split("=").last
  end
end

run API.new
