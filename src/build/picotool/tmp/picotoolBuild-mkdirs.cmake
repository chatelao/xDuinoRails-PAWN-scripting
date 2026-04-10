# Distributed under the OSI-approved BSD 3-Clause License.  See accompanying
# file Copyright.txt or https://cmake.org/licensing for details.

cmake_minimum_required(VERSION 3.5)

file(MAKE_DIRECTORY
  "/app/src/build/_deps/picotool-src"
  "/app/src/build/_deps/picotool-build"
  "/app/src/build/_deps"
  "/app/src/build/picotool/tmp"
  "/app/src/build/picotool/src/picotoolBuild-stamp"
  "/app/src/build/picotool/src"
  "/app/src/build/picotool/src/picotoolBuild-stamp"
)

set(configSubDirs )
foreach(subDir IN LISTS configSubDirs)
    file(MAKE_DIRECTORY "/app/src/build/picotool/src/picotoolBuild-stamp/${subDir}")
endforeach()
if(cfgdir)
  file(MAKE_DIRECTORY "/app/src/build/picotool/src/picotoolBuild-stamp${cfgdir}") # cfgdir has leading slash
endif()
