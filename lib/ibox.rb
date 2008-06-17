# Ibox
module Ibox
  
  def ibox_skin=(skin)
    @@skin = skin
  end
  
  def ibox_head(absolute_path = nil)
      if absolute_path.nil?
        # if not passed in, just guess the location.  Probably right anyway.
        absolute_path = "#{request.protocol.to_s}#{request.host_with_port.to_s}/ibox/"
      end
      absolute_path << "/" unless absolute_path =~ /\/$/
      
      skin = ""
      if (defined?(IBOX_SKIN) && IBOX_SKIN != :default)
        skin_s = IBOX_SKIN
        skin = "skins/#{skin_s}/#{skin_s}.css"
      end
      
      ap_no_trailing = absolute_path.gsub(/\/$/, '')
      script = "<script type=\"text/javascript\" src=\"#{ap_no_trailing}/ibox.js\"></script>
      <link href=\"#{ap_no_trailing}/ibox.css\" rel=\"stylesheet\" type=\"text/css\" media=\"screen\" />"
      script += "<link href=\"#{ap_no_trailing}/#{skin}\" rel=\"stylesheet\" type=\"text/css\" media=\"screen\" />" unless skin.empty?
      script
  end

  def link_to_ibox(name, options = {}, html_options = {}, ibox_options = {})
      ibox_attribute =  defined?(IBOX_ATTRIBUTE) ? IBOX_ATTRIBUTE : "rel"
      
      unless ibox_options.empty?
        _ibox_options = ibox_options.map { |g,h| g.to_s << "=" << h.to_s }
        _i = _ibox_options.to_a.join("&amp;")
        rel_options = "ibox&amp;#{_i}"
      else
        rel_options = "ibox"
      end

      
      html_options.merge!({ibox_attribute => rel_options})
      link_to(name, options , html_options)
  end
    

end
ActionView::Base.send(:include, Ibox)
