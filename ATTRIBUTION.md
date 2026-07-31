# AR3 robot meshes

`website/src/assets/models/robot.glb` is derived from the AR3 robot link STL
meshes of the open-source `ar3_core` ROS package
(https://github.com/ongdexter/ar3_core), MIT License,
Copyright (c) 2021 Dexter Ong. (The original STLs were removed once
robot.glb replaced them; they remain in git history.)

Derivation: each link's solid bodies (motors, gearboxes, couplers, brackets,
pulleys, covers) were separated by connected-component analysis and given
materials matching the real robot. The single file holds the whole arm as a
base_link > link_1 > ... node hierarchy posed at the URDF home pose, one
flat-shaded mesh per link and finish, named `LINK__MATERIAL`. The site
loads robot.glb and re-parents the meshes onto its joint chain by name;
geometry is unchanged from the STLs.

The AR2/AR3 robot itself is an open-source design by Annin Robotics
(https://www.anninrobotics.com). Kinematic data (joint origins and axes)
comes from `ar3_description/urdf/ar3.urdf` in the same package.
