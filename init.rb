ActionView::Base.send :include, Ibox

# install files if missing. I prefer this to install.rb because it allows it to be checked out vs installed without issue.
PUBLIC = File.join([File.dirname(__FILE__), %w(.. .. .. public)].flatten)
unless File.exists? File.join(PUBLIC, 'ibox')
  puts "** Installing ibox files in public folder"
  IBOX_ASSETS = File.join(File.dirname(__FILE__), 'assets', 'ibox')
  FileUtils.cp_r Dir[IBOX_ASSETS], PUBLIC
end